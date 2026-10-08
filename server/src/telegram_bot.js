/**
 * E'lonUZ — To'liq Real Telegram Bot Dasturi
 * 
 * Ushbu dastur Telegram serverlari bilan bevosita (Long Polling) orqali ulanadi.
 * E'lonUZ bazasi (GitHub db.json) bilan sinxron ishlaydi.
 * 
 * Ishga tushirish:
 *   node server/src/telegram_bot.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// .env faylidan o'qish (agar mavjud bo'lsa)
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'server/.env')
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      try {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        for (const line of lines) {
          const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
          if (match && !process.env[match[1]]) {
            process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
          }
        }
      } catch (e) {}
    }
  }
}
loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8765955159:AAGBjGwTdGRyyETAwgbtqUjKzpNouNcvJzo';
const GH_REPO = 'madaminovazizbek9367-png/elonuz-marketplace';
const DB_URL = `https://raw.githubusercontent.com/${GH_REPO}/master/db.json`;

let lastUpdateId = 0;
let isPolling = false;

// ─── HTTP yordamchi funksiyalari ─────────────────────────────────────────────

function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// ─── Telegram Bot API metodlari ──────────────────────────────────────────────

async function botApi(method, payload = {}) {
  if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN kiritilmagan! Iltimos @BotFather dan olingan tokenni kiriting.");
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  return httpRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, payload);
}

// Xabar yuborish
async function sendMessage(chatId, text, replyMarkup = null) {
  return botApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup
  });
}

// Rasm bilan xabar yuborish
async function sendPhoto(chatId, photoUrl, caption, replyMarkup = null) {
  try {
    return await botApi('sendPhoto', {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
  } catch (err) {
    // Agar rasm ochilmasa, oddiy matn qilib yuboramiz
    return sendMessage(chatId, caption, replyMarkup);
  }
}

// ─── Baza (db.json) dan ma'lumot olish ────────────────────────────────────────

async function fetchLiveDb() {
  try {
    const res = await httpRequest(`${DB_URL}?t=${Date.now()}`, {
      headers: { 'User-Agent': 'ElonUz-Bot' }
    });
    return res || { products: [], users: [] };
  } catch (err) {
    console.error("Baza yuklanmadi:", err.message);
    return { products: [], users: [] };
  }
}

// ─── Buyruqlarni bajarish (Bot mantiqi) ──────────────────────────────────────

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const fromName = msg.from.first_name || 'Foydalanuvchi';

  console.log(`[Xabar] ${fromName} (${chatId}): ${text}`);

  // /start buyrug'i
  if (text.startsWith('/start')) {
    const welcome = `Assalomu alaykum, <b>${fromName}</b>! 👋\n\n` +
      `<b>E'lonUZ</b> — O'zbekistondagi eng erkin va qulay e'lonlar platformasining rasmiy botiga xush kelibsiz!\n\n` +
      `Quyidagi buyruqlardan foydalanishingiz mumkin:\n` +
      `🛒 <b>/elonlar</b> — Saytdagi eng yangi e'lonlar\n` +
      `🔍 <b>/qidiruv [nom]</b> — Mahsulot qidirish (masalan: <i>/qidiruv iPhone</i>)\n` +
      `📊 <b>/statistika</b> — Sayt ko'rsatkichlari\n` +
      `🌐 <b>/sayt</b> — E'lonUZ veb-saytiga o'tish\n` +
      `📞 <b>/boglanish</b> — Admin bilan bog'lanish`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "🛒 Yangi e'lonlar", callback_data: "cmd_elonlar" },
          { text: "🌐 Veb-saytga o'tish", url: "https://elonuz-bozor.surge.sh" }
        ],
        [
          { text: "🔍 Qidiruv", callback_data: "cmd_qidiruv" },
          { text: "📊 Statistika", callback_data: "cmd_stats" }
        ],
        [
          { text: "📞 Aloqa (@Mdmnv_77)", url: "https://t.me/Mdmnv_77" }
        ]
      ]
    };

    return sendMessage(chatId, welcome, keyboard);
  }

  // /elonlar buyrug'i
  if (text.startsWith('/elonlar')) {
    const db = await fetchLiveDb();
    const products = (db.products || []).slice(0, 5);

    if (products.length === 0) {
      return sendMessage(chatId, "Hozircha saytda e'lonlar mavjud emas.");
    }

    await sendMessage(chatId, `🛍️ <b>Eng so'nggi e'lonlar (${products.length} ta):</b>`);

    for (const p of products) {
      const priceText = `${new Intl.NumberFormat('uz-UZ').format(p.price)} ${p.currency || 'UZS'}`;
      const caption = `📌 <b>${p.title}</b>\n\n` +
        `💰 <b>Narxi:</b> ${priceText}\n` +
        `📍 <b>Hudud:</b> ${p.location || "O'zbekiston"}\n` +
        `👁️ <b>Ko'rishlar:</b> ${p.views || 0}\n` +
        `📦 <b>Holati:</b> ${p.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "👉 Saytda ko'rish va sotib olish", url: `https://elonuz-bozor.surge.sh` }]
        ]
      };

      if (p.primary_image) {
        await sendPhoto(chatId, p.primary_image, caption, keyboard);
      } else {
        await sendMessage(chatId, caption, keyboard);
      }
    }
    return;
  }

  // /qidiruv buyrug'i
  if (text.startsWith('/qidiruv')) {
    const query = text.replace('/qidiruv', '').trim().toLowerCase();
    if (!query) {
      return sendMessage(chatId, "Iltimos qidirilayotgan mahsulot nomini yozing.\nMisol: <code>/qidiruv cobalt</code> yoki <code>/qidiruv iphone</code>");
    }

    const db = await fetchLiveDb();
    const found = (db.products || []).filter(p => 
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    ).slice(0, 5);

    if (found.length === 0) {
      return sendMessage(chatId, `😔 "<b>${query}</b>" bo'yicha hech qanday e'lon topilmadi.\nBoshqa so'z bilan qidirib ko'ring.`);
    }

    await sendMessage(chatId, `🔍 "<b>${query}</b>" bo'yicha ${found.length} ta e'lon topildi:`);

    for (const p of found) {
      const priceText = `${new Intl.NumberFormat('uz-UZ').format(p.price)} ${p.currency || 'UZS'}`;
      const caption = `📌 <b>${p.title}</b>\n` +
        `💰 Narxi: <b>${priceText}</b>\n` +
        `📍 Joylashuv: ${p.location || "O'zbekiston"}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "👉 E'lonni ochish", url: "https://elonuz-bozor.surge.sh" }]
        ]
      };

      if (p.primary_image) {
        await sendPhoto(chatId, p.primary_image, caption, keyboard);
      } else {
        await sendMessage(chatId, caption, keyboard);
      }
    }
    return;
  }

  // /statistika buyrug'i
  if (text.startsWith('/statistika')) {
    const db = await fetchLiveDb();
    const prodCount = (db.products || []).length;
    const userCount = (db.users || []).length;
    const totalViews = (db.products || []).reduce((sum, p) => sum + (p.views || 0), 0);

    const statsMsg = `📊 <b>E'lonUZ Sayt Statistikasi:</b>\n\n` +
      `📦 Jami faol e'lonlar: <b>${prodCount} ta</b>\n` +
      `👥 Ro'yxatdan o'tgan foydalanuvchilar: <b>${userCount} ta</b>\n` +
      `👁️ Barcha ko'rishlar: <b>${totalViews} ta</b>\n` +
      `⚡ Onlayn platforma: <b>24/7 ishlamoqda</b>`;

    return sendMessage(chatId, statsMsg, {
      inline_keyboard: [
        [{ text: "🌐 Saytni ko'rish", url: "https://elonuz-bozor.surge.sh" }]
      ]
    });
  }

  // /sayt yoki /boglanish
  if (text.startsWith('/sayt')) {
    return sendMessage(chatId, "Rasmiy veb-sayt: https://elonuz-bozor.surge.sh\nBarcha qurilmalarda tezkor ishlaydi!", {
      inline_keyboard: [[{ text: "🚀 Saytga kirish", url: "https://elonuz-bozor.surge.sh" }]]
    });
  }

  if (text.startsWith('/boglanish')) {
    return sendMessage(chatId, "Savollar va takliflar uchun Administrator:\nTelegram: @Mdmnv_77\nTelefon: +998 90 123 45 67");
  }

  // Agar oddiy so'z yozilgan bo'lsa, avtomatik qidiruv qilamiz
  if (text.length >= 3 && !text.startsWith('/')) {
    const db = await fetchLiveDb();
    const query = text.toLowerCase();
    const found = (db.products || []).filter(p => 
      (p.title && p.title.toLowerCase().includes(query))
    ).slice(0, 3);

    if (found.length > 0) {
      let reply = `🔍 "<b>${text}</b>" bo'yicha topilganlar:\n\n`;
      found.forEach((p, i) => {
        reply += `${i + 1}. <b>${p.title}</b> — ${p.price?.toLocaleString()} ${p.currency}\n`;
      });
      reply += `\nBatafsil saytda ko'ring 👇`;
      return sendMessage(chatId, reply, {
        inline_keyboard: [[{ text: "🌐 E'lonUZ ga o'tish", url: "https://elonuz-bozor.surge.sh" }]]
      });
    }
  }

  // Tushunarsiz buyruq bo'lsa
  return sendMessage(chatId, "Kechirasiz, buyruq tushunarsiz.\n/start bosing yoki /elonlar deb yozing.");
}

// ─── Callback Query (Tugmalar bosilganda) ────────────────────────────────────

async function handleCallback(cb) {
  const chatId = cb.message.chat.id;
  const data = cb.data;

  // Telegramga javob qaytarish (loaderni to'xtatish)
  try {
    await botApi('answerCallbackQuery', { callback_query_id: cb.id });
  } catch {}

  if (data === 'cmd_elonlar') {
    return handleMessage({ chat: { id: chatId }, text: '/elonlar', from: cb.from });
  }
  if (data === 'cmd_stats') {
    return handleMessage({ chat: { id: chatId }, text: '/statistika', from: cb.from });
  }
  if (data === 'cmd_qidiruv') {
    return sendMessage(chatId, "Mahsulot qidirish uchun <code>/qidiruv [nom]</code> yozing.\nMisol: <code>/qidiruv telefon</code>");
  }
}

// ─── Polling sikli (Telegramdan yangi xabarlarni doimiy olish) ────────────────

async function pollUpdates() {
  if (!BOT_TOKEN) {
    console.log("⚠️ DIQQAT: TELEGRAM_BOT_TOKEN kiritilmagan.");
    console.log("Botni real Telegramda ishga tushirish uchun @BotFather dan olingan tokenni kiriting.");
    return;
  }

  console.log("🚀 E'lonUZ Telegram Bot polling ishga tushmoqda...");

  try {
    const me = await botApi('getMe');
    if (me && me.ok) {
      console.log(`✅ BOT ULANTI! Bot nomi: @${me.result.username} (${me.result.first_name})`);
      // Buyruqlar menyusini sozlash
      try {
        await botApi('setMyCommands', {
          commands: [
            { command: 'start', description: 'Botni ishga tushirish' },
            { command: 'elonlar', description: 'Barcha yangi e\'lonlar' },
            { command: 'qidiruv', description: 'Mahsulot qidirish' },
            { command: 'statistika', description: 'Bozor statistikasi' },
            { command: 'sayt', description: 'E\'lonUZ veb-saytiga o\'tish' },
            { command: 'boglanish', description: 'Admin bilan bog\'lanish' }
          ]
        });
      } catch (e) {}
    } else {
      console.error("❌ Bot tokenni tekshiring:", me);
      return;
    }
  } catch (err) {
    console.error("❌ Telegram API ulanishda xato:", err.message);
    return;
  }

  isPolling = true;

  while (isPolling) {
    try {
      const res = await botApi('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 30
      });

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;

          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallback(update.callback_query);
          }
        }
      }
    } catch (err) {
      // 3 soniya kutib qayta ulanish
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// ─── Modul eksporti va to'g'ridan-to'g'ri ishga tushirish ──────────────────

if (require.main === module) {
  pollUpdates();
}

module.exports = {
  botApi,
  sendMessage,
  sendPhoto,
  pollUpdates
};
