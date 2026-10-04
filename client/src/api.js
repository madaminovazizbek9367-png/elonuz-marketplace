// API helper utility — GitHub-backed shared database for Surge.sh deployment
// All data is stored in GitHub repository as db.json (visible to all devices!)

const API_BASE = '/api';

// GitHub database config
const GH_TOKEN = import.meta.env.VITE_GH_TOKEN || '';
const GH_REPO = 'madaminovazizbek9367-png/elonuz-marketplace';
const GH_DB_PATH = 'db.json';
const GH_API = 'https://api.github.com';

export const getAuthToken = () => localStorage.getItem('marketplace_token');
export const setAuthToken = (token) => localStorage.setItem('marketplace_token', token);
export const removeAuthToken = () => localStorage.removeItem('marketplace_token');

// Default Seed Categories
const SEED_CATEGORIES = [
  { id: 1, name: 'Uy-joy', slug: 'uy-joy', icon: 'Home', product_count: 0 },
  { id: 2, name: 'Mashina', slug: 'mashina', icon: 'Car', product_count: 0 },
  { id: 3, name: 'Telefon', slug: 'telefon', icon: 'Smartphone', product_count: 0 },
  { id: 4, name: 'Kompyuter', slug: 'kompyuter', icon: 'Laptop', product_count: 0 },
  { id: 5, name: 'Maishiy texnika', slug: 'maishiy-texnika', icon: 'Tv', product_count: 0 },
  { id: 6, name: 'Mebel', slug: 'mebel', icon: 'Armchair', product_count: 0 },
  { id: 7, name: 'Kiyim', slug: 'kiyim', icon: 'Shirt', product_count: 0 },
  { id: 8, name: 'Elektronika', slug: 'elektronika', icon: 'Headphones', product_count: 0 },
  { id: 9, name: 'Chorva va Parrandalar', slug: 'chorva-parrandalar', icon: 'PawPrint', product_count: 0 },
  { id: 10, name: 'Qishloq xo\'jaligi', slug: 'qishloq-xojaligi', icon: 'Wheat', product_count: 0 },
  { id: 11, name: 'Xizmatlar va Ustalar', slug: 'xizmatlar', icon: 'Wrench', product_count: 0 },
  { id: 12, name: 'Ish o\'rinlari', slug: 'ish-orinlari', icon: 'Briefcase', product_count: 0 },
  { id: 13, name: 'Boshqa', slug: 'boshqa', icon: 'Package', product_count: 0 }
];

// ─── GitHub Database Layer ────────────────────────────────────────────────────

let _dbCache = null;
let _dbSha = null;
let _cacheTime = 0;
function unicodeToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function b64DecodeUnicode(str) {
  const clean = str.replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function ghGet() {
  const now = Date.now();
  if (_dbCache && (now - _cacheTime) < CACHE_TTL) {
    return { db: _dbCache, sha: _dbSha };
  }
  const res = await fetch(`${GH_API}/repos/${GH_REPO}/contents/${GH_DB_PATH}`, {
    headers: {
      'Authorization': `token ${GH_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) throw new Error('DB o\'qishda xato');
  const json = await res.json();
  const content = JSON.parse(b64DecodeUnicode(json.content));
  _dbCache = content;
  _dbSha = json.sha;
  _cacheTime = now;
  return { db: content, sha: json.sha };
}

async function ghPut(db, sha) {
  const content = unicodeToB64(JSON.stringify(db, null, 2));
  const res = await fetch(`${GH_API}/repos/${GH_REPO}/contents/${GH_DB_PATH}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GH_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: 'db: update marketplace data',
      content,
      sha
    })
  });
  if (!res.ok) {
    const err = await res.json();
    // If 409 conflict, re-fetch and retry
    if (res.status === 409) {
      _dbCache = null; // invalidate cache
      throw new Error('CONFLICT');
    }
    throw new Error(err.message || 'DB yozishda xato');
  }
  const json = await res.json();
  _dbCache = db;
  _dbSha = json.content.sha;
  _cacheTime = Date.now();
  return json;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

function makeToken(user) {
  return btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role }));
}

function parseToken(token) {
  if (!token) return null;
  try {
    if (token.includes('.')) {
      return JSON.parse(atob(token.split('.')[1]));
    }
    return JSON.parse(atob(token));
  } catch { return null; }
}

function getCurrentUser(users) {
  const token = getAuthToken();
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload) return null;
  return users.find(u => u.id === payload.id || u.username === payload.username) || null;
}

// ─── GitHub API Handler ───────────────────────────────────────────────────────

async function githubApiHandler(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  if (options.body && typeof options.body === 'string') {
    try { body = JSON.parse(options.body); } catch { body = {}; }
  } else if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    body = options.body;
  }

  const { db, sha } = await ghGet();

  // Ensure admin user exists
  if (!db.users) db.users = [];
  if (!db.products) db.products = [];
  if (!db.favorites) db.favorites = [];
  if (!db.messages) db.messages = [];
  if (!db.reviews) db.reviews = [];

  let adminUser = db.users.find(u => u.username === 'admin');
  if (!adminUser) {
    adminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@marketplace.uz',
      phone: '+998 90 123 45 67',
      telegram_username: 'Mdmnv_77',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      is_verified: 1,
      is_blocked: 0,
      created_at: new Date().toISOString()
    };
    db.users.push(adminUser);
    await ghPut(db, sha);
  }

  const currentUser = getCurrentUser(db.users);

  // ── Auth ──────────────────────────────────────────────────────────────────

  if (endpoint === '/auth/register' && method === 'POST') {
    const { username, email, phone, password, avatar_url, telegram_username } = body;
    if (!username || !email || !password) throw new Error('Barcha maydonlarni to\'ldiring');
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Bu username allaqachon band!');
    }
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan!');
    }
    const newUser = {
      id: Date.now(),
      username, email, phone,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      telegram_username: telegram_username || null,
      role: 'user',
      is_verified: 0,
      is_blocked: 0,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    await ghPut(db, sha);
    return { token: makeToken(newUser), user: newUser };
  }

  if (endpoint === '/auth/login' && method === 'POST') {
    const identifier = (body.login || body.identifier || '').trim();
    const password = body.password || '';

    if (identifier.toLowerCase() === 'admin') {
      if (password !== '07082011admin' && password !== 'BozorAdmin2026!#') {
        throw new Error('Admin paroli noto\'g\'ri!');
      }
      const admin = db.users.find(u => u.username === 'admin');
      return { token: makeToken(admin), user: admin };
    }

    const found = db.users.find(u =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      u.email.toLowerCase() === identifier.toLowerCase()
    );
    if (!found) throw new Error('Foydalanuvchi topilmadi');
    if (found.is_blocked) throw new Error('Hisobingiz bloklangan. Admin bilan bog\'laning.');
    return { token: makeToken(found), user: found };
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    if (!currentUser) throw new Error('Avtorizatsiyadan o\'tilmagan');
    return { user: currentUser };
  }

  if (endpoint === '/auth/me' && method === 'PUT') {
    if (!currentUser) throw new Error('Avtorizatsiyadan o\'tilmagan');
    const idx = db.users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...body };
    }
    await ghPut(db, sha);
    return { user: db.users[idx] };
  }

  if (endpoint === '/auth/verify-badge' && method === 'POST') {
    if (!currentUser) throw new Error('Avtorizatsiyadan o\'tilmagan');
    const idx = db.users.findIndex(u => u.id === currentUser.id);
    db.users[idx].is_verified = db.users[idx].is_verified ? 0 : 1;
    await ghPut(db, sha);
    return { message: 'Holat yangilandi', is_verified: db.users[idx].is_verified };
  }

  // ── Categories ────────────────────────────────────────────────────────────

  if (endpoint === '/categories' && method === 'GET') {
    const cats = SEED_CATEGORIES.map(c => ({
      ...c,
      product_count: db.products.filter(p => p.category_id === c.id).length
    }));
    return { categories: cats };
  }

  // ── Products ──────────────────────────────────────────────────────────────

  if (endpoint.startsWith('/products') && method === 'GET' && !endpoint.includes('/ai-describe')) {
    // Single product?
    const singleMatch = endpoint.match(/^\/products\/(\d+)$/);
    if (singleMatch) {
      const prodId = parseInt(singleMatch[1]);
      const p = db.products.find(x => x.id === prodId);
      if (!p) throw new Error('E\'lon topilmadi');
      // Increment views
      const pidx = db.products.findIndex(x => x.id === prodId);
      db.products[pidx].views = (db.products[pidx].views || 0) + 1;
      ghPut(db, sha).catch(() => {}); // fire-and-forget

      const seller = db.users.find(u => u.id === p.user_id) || {};
      const sellerReviews = db.reviews.filter(r => r.seller_id === p.user_id);
      const avgRating = sellerReviews.length > 0
        ? (sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length).toFixed(1)
        : null;
      const isFav = currentUser ? db.favorites.some(f => f.user_id === currentUser.id && f.product_id === p.id) : false;
      return {
        product: {
          ...p,
          views: db.products[pidx].views,
          seller_username: seller.username || 'Foydalanuvchi',
          seller_avatar: seller.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.username || 'u'}`,
          seller_phone: seller.phone || '+998 90 000 00 00',
          seller_verified: seller.is_verified || 0,
          seller_telegram: seller.telegram_username || null,
          seller_rating: avgRating ? parseFloat(avgRating) : null,
          seller_reviews_count: sellerReviews.length,
          is_favorited: isFav ? 1 : 0
        },
        images: p.images || [{ image_url: p.primary_image, is_primary: 1 }]
      };
    }

    // List products
    const url = new URL(`http://x${endpoint}`);
    const search = url.searchParams.get('search')?.toLowerCase();
    const category_id = url.searchParams.get('category_id');
    const location = url.searchParams.get('location');
    const condition = url.searchParams.get('condition');
    const is_vip = url.searchParams.get('is_vip');
    const is_urgent = url.searchParams.get('is_urgent');
    const has_video = url.searchParams.get('has_video');
    const user_id = url.searchParams.get('user_id');
    const sort = url.searchParams.get('sort') || 'newest';

    let list = [...db.products];
    if (user_id) list = list.filter(p => p.user_id == user_id);
    if (category_id) list = list.filter(p => p.category_id == category_id);
    if (location) list = list.filter(p => p.location?.toLowerCase().includes(location.toLowerCase()));
    if (condition && condition !== 'all') list = list.filter(p => p.condition === condition);
    if (is_vip) list = list.filter(p => p.is_vip);
    if (is_urgent) list = list.filter(p => p.is_urgent);
    if (has_video) list = list.filter(p => p.video_url && p.video_url.trim().length > 0);
    if (search) list = list.filter(p =>
      p.title?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'views') list.sort((a, b) => (b.views || 0) - (a.views || 0));
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    list = list.map(p => {
      const seller = db.users.find(u => u.id === p.user_id) || {};
      const sellerReviews = db.reviews.filter(r => r.seller_id === p.user_id);
      const avgRating = sellerReviews.length > 0
        ? (sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length).toFixed(1)
        : null;
      const isFav = currentUser ? db.favorites.some(f => f.user_id === currentUser.id && f.product_id === p.id) : false;
      return {
        ...p,
        seller_username: seller.username || 'Foydalanuvchi',
        seller_avatar: seller.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.username || 'u'}`,
        seller_phone: seller.phone || '+998 90 000 00 00',
        seller_verified: seller.is_verified || 0,
        seller_telegram: seller.telegram_username || null,
        seller_rating: avgRating ? parseFloat(avgRating) : null,
        seller_reviews_count: sellerReviews.length,
        is_favorited: isFav ? 1 : 0
      };
    });
    return { products: list, pagination: { total: list.length } };
  }

  if (endpoint === '/products' && method === 'POST') {
    if (!currentUser) throw new Error('E\'lon joylash uchun avval tizimga kiring');
    const newProduct = {
      id: Date.now(),
      user_id: currentUser.id,
      title: body.title,
      category_id: parseInt(body.category_id) || 1,
      price: parseFloat(body.price) || 0,
      old_price: body.old_price ? parseFloat(body.old_price) : null,
      currency: body.currency || 'UZS',
      condition: body.condition || 'new',
      location: body.location || 'Toshkent',
      description: body.description || '',
      primary_image: (body.images && body.images[0]) || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      images: (body.images || []).map((img, idx) => ({ image_url: img, is_primary: idx === 0 ? 1 : 0 })),
      is_vip: body.is_vip ? 1 : 0,
      is_top: body.is_top ? 1 : 0,
      is_urgent: body.is_urgent ? 1 : 0,
      video_url: body.video_url || null,
      extra_details: body.extra_details ? JSON.stringify(body.extra_details) : null,
      views: 0,
      created_at: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    await ghPut(db, sha);
    return { message: 'E\'lon muvaffaqiyatli joylashtirildi!', productId: newProduct.id };
  }

  const prodEditMatch = endpoint.match(/^\/products\/(\d+)$/);
  if (prodEditMatch && method === 'PUT') {
    if (!currentUser) throw new Error('Avtorizatsiya talab etiladi');
    const prodId = parseInt(prodEditMatch[1]);
    const idx = db.products.findIndex(x => x.id === prodId);
    if (idx === -1) throw new Error('E\'lon topilmadi');
    db.products[idx] = {
      ...db.products[idx], ...body,
      category_id: parseInt(body.category_id) || db.products[idx].category_id,
      price: parseFloat(body.price) || db.products[idx].price,
      primary_image: (body.images && body.images[0]) || db.products[idx].primary_image,
      images: (body.images || []).map((img, i) => ({ image_url: img, is_primary: i === 0 ? 1 : 0 }))
    };
    await ghPut(db, sha);
    return { message: 'E\'lon yangilandi', product: db.products[idx] };
  }

  if (prodEditMatch && method === 'DELETE') {
    if (!currentUser) throw new Error('Avtorizatsiya talab etiladi');
    const prodId = parseInt(prodEditMatch[1]);
    db.products = db.products.filter(x => x.id !== prodId);
    await ghPut(db, sha);
    return { message: 'E\'lon o\'chirildi' };
  }

  // ── Favorites ─────────────────────────────────────────────────────────────

  if (endpoint === '/favorites' && method === 'GET') {
    if (!currentUser) return { favorites: [] };
    const userFavIds = db.favorites.filter(f => f.user_id === currentUser.id).map(f => f.product_id);
    return { favorites: db.products.filter(p => userFavIds.includes(p.id)) };
  }

  if (endpoint.startsWith('/favorites/') && method === 'POST') {
    if (!currentUser) throw new Error('Tizimga kiring');
    const prodId = parseInt(endpoint.replace('/favorites/', ''));
    const existIdx = db.favorites.findIndex(f => f.user_id === currentUser.id && f.product_id === prodId);
    let favorited = false;
    if (existIdx > -1) {
      db.favorites.splice(existIdx, 1);
    } else {
      db.favorites.push({ user_id: currentUser.id, product_id: prodId });
      favorited = true;
    }
    await ghPut(db, sha);
    return { favorited, message: favorited ? 'Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi' };
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  if (endpoint === '/messages/conversations' && method === 'GET') {
    if (!currentUser) return { conversations: [] };
    const userMsgs = db.messages.filter(m => m.sender_id === currentUser.id || m.receiver_id === currentUser.id);
    const partnerIds = [...new Set(userMsgs.map(m => m.sender_id === currentUser.id ? m.receiver_id : m.sender_id))];
    const conversations = partnerIds.map(pId => {
      const partner = db.users.find(u => u.id === pId) || { username: 'Foydalanuvchi' };
      const chat = userMsgs.filter(m =>
        (m.sender_id === currentUser.id && m.receiver_id === pId) ||
        (m.sender_id === pId && m.receiver_id === currentUser.id)
      );
      const lastMsg = chat[chat.length - 1] || {};
      return {
        partner_id: pId,
        partner_username: partner.username,
        partner_avatar: partner.avatar_url,
        last_message: lastMsg.msg_type === 'voice' ? '🎙️ Ovozli xabar' : lastMsg.content,
        last_message_time: lastMsg.created_at,
        unread_count: chat.filter(m => m.receiver_id === currentUser.id && !m.is_read).length
      };
    });
    return { conversations };
  }

  const chatMatch = endpoint.match(/^\/messages\/(\d+)$/);
  if (chatMatch && method === 'GET') {
    if (!currentUser) return { messages: [] };
    const otherId = parseInt(chatMatch[1]);
    const otherUser = db.users.find(u => u.id === otherId) || { id: otherId, username: 'Foydalanuvchi' };
    const chat = db.messages.filter(m =>
      (m.sender_id === currentUser.id && m.receiver_id === otherId) ||
      (m.sender_id === otherId && m.receiver_id === currentUser.id)
    ).map(m => ({
      ...m,
      message: m.message || m.content || '',
      content: m.content || m.message || ''
    }));
    chat.forEach(m => { if (m.receiver_id === currentUser.id) m.is_read = 1; });
    // update read status in background
    ghPut(db, sha).catch(() => {});
    return { messages: chat, other_user: otherUser };
  }

  if (endpoint === '/messages' && method === 'POST') {
    if (!currentUser) throw new Error('Avtorizatsiya talab etiladi');
    const msgText = body.message || body.content || '';
    const newMsg = {
      id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: parseInt(body.receiver_id),
      product_id: body.product_id ? parseInt(body.product_id) : null,
      content: msgText,
      message: msgText,
      msg_type: body.msg_type || 'text',
      audio_url: body.audio_url || null,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    db.messages.push(newMsg);
    await ghPut(db, sha);
    return { message: 'Xabar yuborildi', data: newMsg };
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  const reviewMatch = endpoint.match(/^\/reviews\/seller\/(\d+)$/);
  if (reviewMatch && method === 'GET') {
    const sellerId = parseInt(reviewMatch[1]);
    const revs = db.reviews.filter(r => r.seller_id === sellerId).map(r => {
      const reviewer = db.users.find(u => u.id === r.reviewer_id) || {};
      return {
        ...r,
        reviewer_name: reviewer.username || 'Xaridor',
        reviewer_avatar: reviewer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${reviewer.username || 'u'}`
      };
    });
    const avg = revs.length > 0 ? (revs.reduce((a, b) => a + b.rating, 0) / revs.length).toFixed(1) : 0;
    return { reviews: revs, averageRating: parseFloat(avg) || 0, totalReviews: revs.length };
  }

  if (endpoint === '/reviews' && method === 'POST') {
    if (!currentUser) throw new Error('Sharh qoldirish uchun tizimga kiring');
    const { seller_id, rating, comment } = body;
    if (currentUser.id === parseInt(seller_id)) throw new Error('O\'zingizga sharh qoldira olmaysiz');
    const newRev = {
      id: Date.now(),
      seller_id: parseInt(seller_id),
      reviewer_id: currentUser.id,
      rating: parseInt(rating),
      comment: comment || '',
      created_at: new Date().toISOString()
    };
    db.reviews.unshift(newRev);
    await ghPut(db, sha);
    return { message: 'Sharhingiz qabul qilindi', review: newRev };
  }

  // ── AI Description Generator ──────────────────────────────────────────────

  if (endpoint === '/products/ai-describe' && method === 'POST') {
    const { title, category_name, condition, location, price, currency } = body;
    const desc = `🌟 Sotiladi: ${title || 'Mahsulot'}!

✅ Holati: ${condition === 'new' ? 'Yangi, qutisida va kafolatga ega' : 'A\'lo darajada, ehtiyotkorlik bilan ishlatilgan'}.
📍 Joylashuv: ${location || 'O\'zbekiston'}.
💰 Narxi: ${price ? price + ' ' + (currency || 'so\'m') : 'Kelishilgan narxda'} (real xaridorga ozgina kami bor).

Xususiyatlari:
• 100% original va sifatli
• Barcha sinov va tekshiruvlardan o'tgan
• Hech qanday nuqsoni yo'q

Qo'shimcha savollar uchun yozing yoki qo'ng'iroq qiling. Shoshiling!`;
    return { description: desc };
  }

  // ── Upload (image stored as URL — no file server needed) ──────────────────

  if (endpoint === '/upload' && method === 'POST') {
    // Return placeholder since we can't store files in GitHub
    return { urls: ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'] };
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  if (endpoint === '/admin/stats' && method === 'GET') {
    return {
      users_count: db.users.length,
      products_count: db.products.length,
      messages_count: db.messages.length
    };
  }

  if (endpoint === '/admin/users' && method === 'GET') {
    return { users: db.users };
  }

  if (endpoint.startsWith('/admin/users/') && endpoint.endsWith('/block')) {
    const uId = parseInt(endpoint.split('/')[3]);
    const idx = db.users.findIndex(x => x.id === uId);
    if (idx !== -1) {
      db.users[idx].is_blocked = db.users[idx].is_blocked ? 0 : 1;
      await ghPut(db, sha);
    }
    return { message: 'Holat o\'zgartirildi' };
  }

  if (endpoint === '/admin/products' && method === 'GET') {
    return { products: db.products };
  }

  if (endpoint.startsWith('/admin/products/') && method === 'DELETE') {
    const prodId = parseInt(endpoint.split('/')[3]);
    db.products = db.products.filter(x => x.id !== prodId);
    await ghPut(db, sha);
    return { message: 'E\'lon o\'chirildi' };
  }

  return {};
}

// ─── Main apiRequest ──────────────────────────────────────────────────────────

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  // Always use GitHub-backed DB (works everywhere, all devices see same data)
  const isSurge = typeof window !== 'undefined' && (
    window.location.hostname.includes('surge.sh') ||
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:'
  );

  if (isSurge) {
    return githubApiHandler(endpoint, options);
  }

  // Local dev — try real backend first, fall back to GitHub DB
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      return await response.json();
    }
    return githubApiHandler(endpoint, options);
  } catch {
    return githubApiHandler(endpoint, options);
  }
}

export const api = {
  // Auth
  register: (body) => apiRequest('/auth/register', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (body) => apiRequest('/auth/me', { method: 'PUT', body }),

  // Categories
  getCategories: () => apiRequest('/categories'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiRequest(`/products?${query.toString()}`);
  },
  getProductById: (id) => apiRequest(`/products/${id}`),
  createProduct: (body) => apiRequest('/products', { method: 'POST', body }),
  updateProduct: (id, body) => apiRequest(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Favorites
  getFavorites: () => apiRequest('/favorites'),
  toggleFavorite: (productId) => apiRequest(`/favorites/${productId}`, { method: 'POST' }),

  // Messages
  getConversations: () => apiRequest('/messages/conversations'),
  getChatHistory: (otherUserId) => apiRequest(`/messages/${otherUserId}`),
  sendMessage: (body) => apiRequest('/messages', { method: 'POST', body }),

  // Upload
  uploadImages: (formData) => apiRequest('/upload', { method: 'POST', body: formData }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params);
    return apiRequest(`/admin/users?${query.toString()}`);
  },
  toggleUserBlock: (userId) => apiRequest(`/admin/users/${userId}/block`, { method: 'PATCH' }),
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams(params);
    return apiRequest(`/admin/products?${query.toString()}`);
  },
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),

  // Reviews & Rating
  getSellerReviews: (sellerId) => apiRequest(`/reviews/seller/${sellerId}`),
  submitReview: (body) => apiRequest('/reviews', { method: 'POST', body }),

  // AI Description Generator
  generateAiDescription: (body) => apiRequest('/products/ai-describe', { method: 'POST', body }),

  // Verification
  toggleVerifyBadge: () => apiRequest('/auth/verify-badge', { method: 'POST' }),
};
