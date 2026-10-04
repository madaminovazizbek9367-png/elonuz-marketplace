const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedData() {
  // 1. Categories - ensure all modern marketplace categories exist
  const categories = [
    { name: 'Uy-joy', slug: 'uy-joy', icon: 'Home' },
    { name: 'Mashina', slug: 'mashina', icon: 'Car' },
    { name: 'Telefon', slug: 'telefon', icon: 'Smartphone' },
    { name: 'Kompyuter', slug: 'kompyuter', icon: 'Laptop' },
    { name: 'Maishiy texnika', slug: 'maishiy-texnika', icon: 'Tv' },
    { name: 'Mebel', slug: 'mebel', icon: 'Armchair' },
    { name: 'Kiyim', slug: 'kiyim', icon: 'Shirt' },
    { name: 'Elektronika', slug: 'elektronika', icon: 'Headphones' },
    { name: 'Chorva va Parrandalar', slug: 'chorva-parrandalar', icon: 'PawPrint' },
    { name: 'Qishloq xo\'jaligi', slug: 'qishloq-xojaligi', icon: 'Wheat' },
    { name: 'Xizmatlar va Ustalar', slug: 'xizmatlar', icon: 'Wrench' },
    { name: 'Ish o\'rinlari', slug: 'ish-orinlari', icon: 'Briefcase' },
    { name: 'Boshqa', slug: 'boshqa', icon: 'Package' }
  ];

  const checkCat = db.prepare('SELECT id FROM categories WHERE slug = ?');
  const insertCategory = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
  for (const cat of categories) {
    if (!checkCat.get(cat.slug)) {
      insertCategory.run(cat.name, cat.slug, cat.icon);
    }
  }

  // 2. Ensure Admin exists with password 07082011admin
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('07082011admin', salt);
  const existingAdmin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (username, email, phone, telegram_username, password_hash, avatar_url, role)
      VALUES ('admin', 'admin@marketplace.uz', '+998 90 123 45 67', 'Mdmnv_77', ?, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'admin')
    `).run(adminPass);
    console.log('Admin account created with password 07082011admin and telegram Mdmnv_77');
  } else {
    db.prepare("UPDATE users SET password_hash = ?, telegram_username = 'Mdmnv_77' WHERE username = 'admin'").run(adminPass);
    console.log('Admin password updated to 07082011admin and telegram Mdmnv_77');
  }

  console.log('Seed check complete.');
}

module.exports = seedData;
