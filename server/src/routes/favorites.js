const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET all favorites for authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        u.username as seller_username,
        u.avatar_url as seller_avatar,
        u.phone as seller_phone,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image,
        f.created_at as favorited_at,
        1 as is_favorited
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE f.user_id = ? AND p.status = 'active'
      ORDER BY f.created_at DESC
    `).all(userId);

    return res.json({ favorites });
  } catch (err) {
    console.error('Get favorites error:', err);
    return res.status(500).json({ error: 'Sevimlilarni olishda xatolik yuz berdi' });
  }
});

// POST toggle favorite
router.post('/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    // Check if product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }

    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?').get(userId, productId);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      return res.json({ favorited: false, message: 'Sevimlilardan o\'chirildi' });
    } else {
      db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)').run(userId, productId);
      return res.json({ favorited: true, message: 'Sevimlilarga qo\'shildi' });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    return res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
});

module.exports = router;
