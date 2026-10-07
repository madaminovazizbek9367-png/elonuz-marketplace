/**
 * E'lonUZ Telegram Bot Integration Server
 * Telegram Bot API wrapper for E'lonUZ Marketplace
 * 
 * Usage:
 *   $env:TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
 *   node server/src/telegram_bot.js
 */

const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '777000111:AAFakeTokenForDemonstrationOnly2026';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(`${TELEGRAM_API}/sendMessage`);

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
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
    req.write(data);
    req.end();
  });
}

/**
 * Notify a user on Telegram about a new marketplace event
 * @param {string} telegramUsername e.g. "@Mdmnv_77" or chatId
 * @param {string} eventType 'new_message' | 'new_review' | 'price_offer' | 'item_favorited'
 * @param {object} details
 */
async function notifyMarketplaceEvent(targetChatId, eventType, details = {}) {
  let message = '';

  switch (eventType) {
    case 'new_message':
      message = `📬 <b>Yangi xabar keldi!</b>\n\nKimdan: <b>${details.senderName || 'Xaridor'}</b>\nE'lon: <i>${details.productTitle || 'Umumiy'}</i>\n\nXabar: "${details.messageText}"\n\n👉 <a href="https://elonuz-bozor.surge.sh">Saytda javob qaytarish</a>`;
      break;

    case 'new_review':
      message = `⭐ <b>E'loningizga yangi sharh qoldirildi!</b>\n\nBaho: ${'⭐'.repeat(details.rating || 5)}\nSharh: "${details.comment}"\nKimdan: ${details.reviewerName}\n\n👉 <a href="https://elonuz-bozor.surge.sh">Barcha sharhlarni ko'rish</a>`;
      break;

    case 'price_offer':
      message = `🤝 <b>AI Savdolashuv yoki Yangi Narx Taklifi!</b>\n\nE'lon: <b>${details.productTitle}</b>\nAsl narx: ${details.originalPrice}\nTaklif qilingan narx: <b>${details.offeredPrice}</b>\n\n👉 <a href="https://elonuz-bozor.surge.sh">Taklifni ko'rish</a>`;
      break;

    default:
      message = `🔔 <b>E'lonUZ Bildirishnomasi:</b>\n${details.text || 'Yangi xabar mavjud'}`;
  }

  return sendTelegramMessage(targetChatId, message, {
    inline_keyboard: [
      [{ text: "🌐 E'lonUZ saytiga o'tish", url: "https://elonuz-bozor.surge.sh" }]
    ]
  });
}

console.log('🤖 E\'lonUZ Telegram Bot moduli tayyor.');
module.exports = {
  sendTelegramMessage,
  notifyMarketplaceEvent
};
