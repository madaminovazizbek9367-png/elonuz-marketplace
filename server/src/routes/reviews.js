const express = require('express');
const db = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/seller/:sellerId - get seller reviews and rating stats
router.get('/seller/:sellerId', optionalAuth, (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId);
    if (!sellerId) {
      return res.status(400).json({ error: 'Sotuvchi ID noto\'g\'ri' });
    }

    const reviews = db.prepare(`
      SELECT 
        r.id,
        r.seller_id,
        r.reviewer_id,
        r.rating,
        r.comment,
        r.created_at,
        u.username as reviewer_username,
        u.avatar_url as reviewer_avatar,
        u.is_verified as reviewer_is_verified
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
    `).all(sellerId);

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating
      FROM reviews
      WHERE seller_id = ?
    `).get(sellerId);

    return res.json({
      reviews,
      total_reviews: stats ? stats.total_reviews : 0,
      avg_rating: stats && stats.avg_rating ? parseFloat(stats.avg_rating.toFixed(1)) : 5.0
    });
  } catch (err) {
    console.error('Get seller reviews error:', err);
    return res.status(500).json({ error: 'Sharhlarni olishda xatolik' });
  }
});

// POST /api/reviews - submit review for seller
router.post('/', authenticateToken, (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { seller_id, rating, comment } = req.body;

    if (!seller_id) {
      return res.status(400).json({ error: 'Sotuvchi tanlanmadi' });
    }
    if (reviewerId === parseInt(seller_id)) {
      return res.status(400).json({ error: 'O\'zingizga sharh qoldira olmaysiz' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Baho 1 dan 5 gacha bo\'lishi kerak' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Sharh matnini kiriting' });
    }

    // Check if review already exists
    const existing = db.prepare('SELECT id FROM reviews WHERE seller_id = ? AND reviewer_id = ?').get(seller_id, reviewerId);
    if (existing) {
      db.prepare(`
        UPDATE reviews 
        SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(parseInt(rating), comment.trim(), existing.id);

      return res.json({ message: 'Sharhingiz muvaffaqiyatli yangilandi!' });
    }

    db.prepare(`
      INSERT INTO reviews (seller_id, reviewer_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `).run(parseInt(seller_id), reviewerId, parseInt(rating), comment.trim());

    return res.status(201).json({ message: 'Sharh muvaffaqiyatli qoldirildi!' });
  } catch (err) {
    console.error('Submit review error:', err);
    return res.status(500).json({ error: 'Sharh qoldirishda xatolik yuz berdi' });
  }
});

module.exports = router;
