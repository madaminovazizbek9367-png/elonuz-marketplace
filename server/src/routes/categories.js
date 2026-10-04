const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all categories with product counts
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all();

    return res.json({ categories });
  } catch (err) {
    console.error('Categories error:', err);
    return res.status(500).json({ error: 'Kategoriyalarni yuklashda xatolik yuz berdi' });
  }
});

module.exports = router;
