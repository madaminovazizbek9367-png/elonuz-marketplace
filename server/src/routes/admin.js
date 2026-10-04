const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply auth & admin check to all admin routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get().count;
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    const blockedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_blocked = 1').get().count;

    // Recent products
    const recentProducts = db.prepare(`
      SELECT p.id, p.title, p.price, p.currency, p.created_at, p.status, u.username as seller_username
      FROM products p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `).all();

    // Recent users
    const recentUsers = db.prepare(`
      SELECT id, username, email, phone, role, is_blocked, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    return res.json({
      stats: {
        totalUsers,
        totalProducts,
        activeProducts,
        totalMessages,
        blockedUsers
      },
      recentProducts,
      recentUsers
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Statistikani olishda xatolik yuz berdi' });
  }
});

// GET /api/admin/users - list users with search & filter
router.get('/users', (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        u.id, u.username, u.email, u.phone, u.avatar_url, u.role, u.is_blocked, u.created_at,
        COUNT(p.id) as listing_count
      FROM users u
      LEFT JOIN products p ON p.user_id = u.id
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` WHERE u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ?`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const users = db.prepare(query).all(...params);
    return res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    return res.status(500).json({ error: 'Foydalanuvchilarni olishda xatolik yuz berdi' });
  }
});

// PATCH /api/admin/users/:id/block - toggle user block
router.patch('/users/:id/block', (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent self-blocking
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'O\'zingizni bloklay olmaysiz' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const newStatus = user.is_blocked ? 0 : 1;
    db.prepare('UPDATE users SET is_blocked = ? WHERE id = ?').run(newStatus, userId);

    return res.json({
      message: newStatus ? 'Foydalanuvchi muvaffaqiyatli bloklandi' : 'Foydalanuvchi blokdan chiqarildi',
      is_blocked: newStatus
    });
  } catch (err) {
    console.error('Admin block user error:', err);
    return res.status(500).json({ error: 'Foydalanuvchi holatini o\'zgartirishda xatolik' });
  }
});

// GET /api/admin/products - list all products for admin
router.get('/products', (req, res) => {
  try {
    const { search, status } = req.query;
    let whereClauses = [];
    const params = [];

    if (search && search.trim()) {
      whereClauses.push('(p.title LIKE ? OR u.username LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    if (status && status !== 'all') {
      whereClauses.push('p.status = ?');
      params.push(status);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const products = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        u.username as seller_username,
        u.phone as seller_phone,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      ${whereSQL}
      ORDER BY p.created_at DESC
    `).all(...params);

    return res.json({ products });
  } catch (err) {
    console.error('Admin products error:', err);
    return res.status(500).json({ error: 'E\'lonlarni olishda xatolik yuz berdi' });
  }
});

// DELETE /api/admin/products/:id - admin delete product
router.delete('/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);

    if (!existing) {
      return res.status(404).json({ error: 'E\'lon topilmadi' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    return res.json({ message: 'E\'lon administrator tomonidan o\'chirildi' });
  } catch (err) {
    console.error('Admin delete product error:', err);
    return res.status(500).json({ error: 'E\'lonni o\'chirishda xatolik yuz berdi' });
  }
});

module.exports = router;
