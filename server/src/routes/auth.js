const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password, avatar_url, telegram_username } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring (username, email, phone, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    // Check existing username
    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
    if (existingUsername) {
      return res.status(400).json({ error: `"${username}" username allaqachon band. Boshqa username tanlang!` });
    }

    // Check existing email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ error: 'Bu email manzili allaqachon ro\'yxatdan o\'tgan. Boshqa email kiriting!' });
    }

    // Check existing phone
    const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone.trim());
    if (existingPhone) {
      return res.status(400).json({ error: 'Bu telefon raqami allaqachon band. Boshqa raqam kiriting!' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const defaultAvatar = avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
    const cleanTg = telegram_username ? telegram_username.replace('@', '').trim() : null;

    const result = db.prepare(`
      INSERT INTO users (username, email, phone, telegram_username, password_hash, avatar_url, role)
      VALUES (?, ?, ?, ?, ?, ?, 'user')
    `).run(username.trim(), email.trim().toLowerCase(), phone.trim(), cleanTg, password_hash, defaultAvatar);

    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });

    const newUser = db.prepare('SELECT id, username, email, phone, telegram_username, is_verified, avatar_url, role FROM users WHERE id = ?').get(userId);

    return res.status(201).json({
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body; // login can be email or username

    if (!login || !password) {
      return res.status(400).json({ error: 'Login va parolni kiriting' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(login.trim().toLowerCase(), login.trim());

    if (!user) {
      return res.status(400).json({ error: 'Noto\'g\'ri login yoki parol' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ error: 'Sizning hisobingiz bloklangan. Iltimos, administratorga murojaat qiling.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Noto\'g\'ri login yoki parol' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        telegram_username: user.telegram_username,
        is_verified: user.is_verified || 0,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

// Update Profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, phone, avatar_url, telegram_username, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Check if new username is already taken by someone else
    if (username && username !== req.user.username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username.trim(), userId);
      if (existing) {
        return res.status(400).json({ error: 'Bu username boshqa foydalanuvchi tomonidan band qilingan' });
      }
    }

    let query = 'UPDATE users SET ';
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username.trim());
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone.trim());
    }
    if (telegram_username !== undefined) {
      updates.push('telegram_username = ?');
      params.push(telegram_username ? telegram_username.replace('@', '').trim() : null);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url ? avatar_url.trim() : null);
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Parolni o\'zgartirish uchun joriy parolingizni kiriting' });
      }
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
      }
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      updates.push('password_hash = ?');
      params.push(password_hash);
    }

    if (updates.length > 0) {
      query += updates.join(', ') + ' WHERE id = ?';
      params.push(userId);
      db.prepare(query).run(...params);
    }

    const updatedUser = db.prepare('SELECT id, username, email, phone, telegram_username, is_verified, avatar_url, role FROM users WHERE id = ?').get(userId);
    return res.json({
      message: 'Profil muvaffaqiyatli yangilandi',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Profilni yangilashda xatolik yuz berdi' });
  }
});

// POST /api/auth/verify-badge - Toggle or activate verification for user
router.post('/verify-badge', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const current = db.prepare('SELECT is_verified FROM users WHERE id = ?').get(userId);
    const newStatus = current.is_verified ? 0 : 1;
    db.prepare('UPDATE users SET is_verified = ? WHERE id = ?').run(newStatus, userId);

    return res.json({
      message: newStatus ? 'Tabriklaymiz! Sizga "Tasdiqlangan Foydalanuvchi" (✅) ko\'k belgisi berildi!' : 'Tasdiqlash belgisi o\'chirildi.',
      is_verified: newStatus
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Tasdiqlashda xatolik' });
  }
});

module.exports = router;
