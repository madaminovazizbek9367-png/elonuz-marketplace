const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'marketplace.db');
const db = new DatabaseSync(dbPath);

// Enforce foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user', -- 'user' | 'admin'
      is_blocked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'UZS', -- 'UZS' | 'USD'
      condition TEXT NOT NULL, -- 'new' | 'used'
      location TEXT NOT NULL,
      views_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', -- 'active' | 'sold' | 'archived'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      msg_type TEXT DEFAULT 'text', -- 'text' | 'voice'
      audio_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migrations for new columns
  const runSafeAlter = (sql) => {
    try {
      db.exec(sql);
    } catch (e) {
      // Column might already exist, safe to ignore
    }
  };

  // Users new columns
  runSafeAlter("ALTER TABLE users ADD COLUMN telegram_username TEXT;");
  runSafeAlter("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;");

  // Products new columns
  runSafeAlter("ALTER TABLE products ADD COLUMN is_vip INTEGER DEFAULT 0;");
  runSafeAlter("ALTER TABLE products ADD COLUMN is_top INTEGER DEFAULT 0;");
  runSafeAlter("ALTER TABLE products ADD COLUMN is_urgent INTEGER DEFAULT 0;");
  runSafeAlter("ALTER TABLE products ADD COLUMN old_price REAL DEFAULT 0;");
  runSafeAlter("ALTER TABLE products ADD COLUMN video_url TEXT;");
  runSafeAlter("ALTER TABLE products ADD COLUMN extra_details TEXT;");
  runSafeAlter("ALTER TABLE products ADD COLUMN lat REAL;");
  runSafeAlter("ALTER TABLE products ADD COLUMN lng REAL;");

  // Messages new columns
  runSafeAlter("ALTER TABLE messages ADD COLUMN msg_type TEXT DEFAULT 'text';");
  runSafeAlter("ALTER TABLE messages ADD COLUMN audio_url TEXT;");
}

initSchema();

module.exports = db;
