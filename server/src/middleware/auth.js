const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'marketplace_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi (token yo\'q)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, email, phone, telegram_username, is_verified, avatar_url, role, is_blocked FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ error: 'Sizning hisobingiz bloklangan. Iltimos, ma\'muriyatga murojaat qiling.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Yaroqsiz yoki muddati o\'tgan token' });
  }
}

// Optional auth for public views (allows knowing if current viewer liked a product)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT id, username, email, phone, avatar_url, role, is_blocked FROM users WHERE id = ?').get(decoded.id);
      if (user && !user.is_blocked) {
        req.user = user;
      }
    } catch (e) {
      // ignore expired/invalid token in optional auth
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ushbu amal faqat administrator uchun ruxsat etilgan' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalAuth,
  requireAdmin
};
