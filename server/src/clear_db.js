const db = require('./db');
const bcrypt = require('bcryptjs');

// Delete existing demo products, images, favorites, messages
db.exec('DELETE FROM product_images;');
db.exec('DELETE FROM favorites;');
db.exec('DELETE FROM messages;');
db.exec('DELETE FROM products;');

// Delete demo users except admin, update admin password
const salt = bcrypt.genSaltSync(10);
const newAdminPass = bcrypt.hashSync('BozorAdmin2026!#', salt);

db.exec("DELETE FROM users WHERE username != 'admin';");

// Check if admin exists, if not create
const admin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
if (admin) {
  db.prepare("UPDATE users SET password_hash = ?, email = 'admin@marketplace.uz', phone = '+998 90 123 45 67' WHERE id = ?")
    .run(newAdminPass, admin.id);
} else {
  db.prepare("INSERT INTO users (username, email, phone, password_hash, role) VALUES ('admin', 'admin@marketplace.uz', '+998 90 123 45 67', ?, 'admin')")
    .run(newAdminPass);
}

console.log('Database successfully cleaned!');
console.log('Products count:', db.prepare('SELECT count(*) as count FROM products').get().count);
console.log('Users count:', db.prepare('SELECT count(*) as count FROM users').get().count);
console.log('Admin password updated to BozorAdmin2026!#');
