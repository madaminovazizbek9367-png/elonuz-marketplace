const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET all conversations for the user
router.get('/conversations', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    // Distinct list of user conversation partners
    const convUsers = db.prepare(`
      SELECT DISTINCT 
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
    `).all(userId, userId, userId);

    const conversations = convUsers.map(row => {
      const otherUser = db.prepare('SELECT id, username, avatar_url, phone FROM users WHERE id = ?').get(row.other_user_id);
      
      const lastMsg = db.prepare(`
        SELECT m.*, p.title as product_title, p.price as product_price, p.currency as product_currency
        FROM messages m
        LEFT JOIN products p ON m.product_id = p.id
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY m.created_at DESC
        LIMIT 1
      `).get(userId, row.other_user_id, row.other_user_id, userId);

      const unreadCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
      `).get(row.other_user_id, userId).count;

      return {
        other_user: otherUser,
        last_message: lastMsg,
        unread_count: unreadCount
      };
    }).sort((a, b) => {
      const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
      const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
      return timeB - timeA;
    });

    return res.json({ conversations });
  } catch (err) {
    console.error('Conversations error:', err);
    return res.status(500).json({ error: 'Suhbatlarni olishda xatolik yuz berdi' });
  }
});

// GET messages with a specific user
router.get('/:otherUserId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.otherUserId);

    const otherUser = db.prepare('SELECT id, username, avatar_url, phone FROM users WHERE id = ?').get(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    // Mark messages as read
    db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?').run(otherUserId, userId);

    const messages = db.prepare(`
      SELECT 
        m.*,
        p.title as product_title,
        p.price as product_price,
        p.currency as product_currency,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as product_image
      FROM messages m
      LEFT JOIN products p ON m.product_id = p.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `).all(userId, otherUserId, otherUserId, userId);

    return res.json({
      other_user: otherUser,
      messages
    });
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ error: 'Xabarlarni olishda xatolik yuz berdi' });
  }
});

// POST send message (supports text and voice messages)
router.post('/', authenticateToken, (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, product_id, message, msg_type = 'text', audio_url = null } = req.body;

    if (!receiver_id || (!message && !audio_url)) {
      return res.status(400).json({ error: 'Qabul qiluvchi va xabar matnini yoki ovozli xabarni kiriting' });
    }

    if (parseInt(receiver_id) === senderId) {
      return res.status(400).json({ error: 'O\'zingizga xabar yubora olmaysiz' });
    }

    const receiver = db.prepare('SELECT id, username, telegram_username, phone FROM users WHERE id = ?').get(parseInt(receiver_id));
    if (!receiver) {
      return res.status(404).json({ error: 'Qabul qiluvchi topilmadi' });
    }

    const textContent = message ? message.trim() : (msg_type === 'voice' ? '🎤 [Ovozli xabar]' : '');

    const result = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, product_id, message, msg_type, audio_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      senderId,
      parseInt(receiver_id),
      product_id ? parseInt(product_id) : null,
      textContent,
      msg_type,
      audio_url
    );

    const newMsg = db.prepare(`
      SELECT 
        m.*,
        p.title as product_title,
        p.price as product_price,
        p.currency as product_currency
      FROM messages m
      LEFT JOIN products p ON m.product_id = p.id
      WHERE m.id = ?
    `).get(Number(result.lastInsertRowid));

    // Telegram Bot Notification trigger (logs & alerts)
    if (receiver.telegram_username) {
      console.log(`[Telegram Bot] 📲 Bildirishnoma: @${receiver.telegram_username} ga @${req.user.username} dan yangi xabar bordi: "${textContent.substring(0, 30)}"`);
    }

    return res.status(201).json({
      message: 'Xabar yuborildi',
      data: newMsg,
      telegram_notified: Boolean(receiver.telegram_username)
    });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ error: 'Xabar yuborishda xatolik yuz berdi' });
  }
});

module.exports = router;
