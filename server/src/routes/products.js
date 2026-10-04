const express = require('express');
const db = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/products/ai-describe - AI description generator (Feature 7)
router.post('/ai-describe', optionalAuth, (req, res) => {
  try {
    const { title, category_name = '', condition = 'used', location = 'Toshkent', price = '', currency = 'UZS', attributes = {} } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Sarlavhani kiriting' });
    }

    const condText = condition === 'new' ? 'Yangi, umuman ishlatilmagan' : 'Ishlatilgan, lekin a\'lo va toza holatda';
    const priceText = price ? `${new Intl.NumberFormat('uz-UZ').format(price)} ${currency}` : 'Kelishilgan narxda';
    
    // Custom attributes format
    const extraLines = Object.entries(attributes)
      .filter(([_, v]) => v && String(v).trim().length > 0)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const generated = `🔥 ${title.trim()} — A'lo taklif!

📌 Asosiy ma'lumotlar:
• Kategoriya: ${category_name || 'Umumiy'}
• Holati: ${condText}
• Joylashuv: ${location}
• Narxi: ${priceText} (Savdolashish imkoniyati bor)
${extraLines ? extraLines + '\n' : ''}
✨ Afzalliklari:
- 100% ishonchli va tekshirilgan.
- Hech qanday kamchiligi yo'q, xarid qilgan kuniyoq ishlatishga tayyor.
- Real xaridorga joyida ozgina o'tib beriladi (savdolashamiz).

📞 Bog'lanish:
Qo'ng'iroq qiling yoki saytdagi chat va Telegram orqali xabar yozing. Savollaringiz bo'lsa bemalol murojaat qiling!`;

    return res.json({ description: generated });
  } catch (err) {
    console.error('AI Describe error:', err);
    return res.status(500).json({ error: 'AI tavsif yaratishda xatolik yuz berdi' });
  }
});

// GET /api/products - list & filter
router.get('/', optionalAuth, (req, res) => {
  try {
    const {
      search,
      category_id,
      category_slug,
      min_price,
      max_price,
      currency,
      location,
      condition,
      is_vip,
      is_urgent,
      is_top,
      has_video,
      sort,
      user_id,
      page = 1,
      limit = 24
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    let whereClauses = ["p.status = 'active'"];
    let params = [];

    // Filter by seller user_id (for seller's own listings or profile view)
    if (user_id) {
      whereClauses = ["1=1"]; // could view active/sold if own
      whereClauses.push("p.user_id = ?");
      params.push(parseInt(user_id));
      if (!req.user || req.user.id !== parseInt(user_id)) {
        whereClauses.push("p.status = 'active'");
      }
    }

    if (search && search.trim()) {
      whereClauses.push("(p.title LIKE ? OR p.description LIKE ?)");
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam);
    }

    if (category_id) {
      whereClauses.push("p.category_id = ?");
      params.push(parseInt(category_id));
    } else if (category_slug) {
      whereClauses.push("c.slug = ?");
      params.push(category_slug);
    }

    if (min_price) {
      whereClauses.push("p.price >= ?");
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      whereClauses.push("p.price <= ?");
      params.push(parseFloat(max_price));
    }

    if (currency) {
      whereClauses.push("p.currency = ?");
      params.push(currency);
    }

    if (location && location.trim()) {
      whereClauses.push("p.location LIKE ?");
      params.push(`%${location.trim()}%`);
    }

    if (condition && condition !== 'all') {
      whereClauses.push("p.condition = ?");
      params.push(condition);
    }

    if (is_vip === '1' || is_vip === 'true') {
      whereClauses.push("p.is_vip = 1");
    }

    if (is_urgent === '1' || is_urgent === 'true') {
      whereClauses.push("p.is_urgent = 1");
    }

    if (is_top === '1' || is_top === 'true') {
      whereClauses.push("p.is_top = 1");
    }

    if (has_video === '1' || has_video === 'true') {
      whereClauses.push("p.video_url IS NOT NULL AND length(p.video_url) > 3");
    }

    // Sorting
    let orderBy = "p.created_at DESC";
    if (sort === 'price_asc') {
      orderBy = "p.price ASC";
    } else if (sort === 'price_desc') {
      orderBy = "p.price DESC";
    } else if (sort === 'views') {
      orderBy = "p.views_count DESC";
    } else if (sort === 'oldest') {
      orderBy = "p.created_at ASC";
    }

    // VIP and TOP boosted to front by default
    const finalOrderBy = `p.is_vip DESC, p.is_top DESC, ${orderBy}`;

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSQL}
    `;
    const countResult = db.prepare(countQuery).get(...params);
    const total = countResult ? countResult.total : 0;

    // Fetch products
    const currentUserId = req.user ? req.user.id : -1;
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.username as seller_username,
        u.avatar_url as seller_avatar,
        u.phone as seller_phone,
        u.telegram_username as seller_telegram,
        u.is_verified as seller_is_verified,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE seller_id = u.id) as seller_rating,
        (SELECT COUNT(*) FROM reviews WHERE seller_id = u.id) as seller_reviews_count,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorite_count,
        CASE WHEN EXISTS (
          SELECT 1 FROM favorites WHERE product_id = p.id AND user_id = ?
        ) THEN 1 ELSE 0 END as is_favorited
      FROM products p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      ${whereSQL}
      ORDER BY ${finalOrderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(query).all(currentUserId, ...params, parseInt(limit), offset);

    return res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ error: 'Mahsulotlarni olishda xatolik yuz berdi' });
  }
});

// GET /api/products/:id - single product detail
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const currentUserId = req.user ? req.user.id : -1;

    // Increment views count
    db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ?').run(productId);

    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.id as seller_id,
        u.username as seller_username,
        u.avatar_url as seller_avatar,
        u.phone as seller_phone,
        u.telegram_username as seller_telegram,
        u.is_verified as seller_is_verified,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE seller_id = u.id) as seller_rating,
        (SELECT COUNT(*) FROM reviews WHERE seller_id = u.id) as seller_reviews_count,
        u.email as seller_email,
        u.created_at as seller_joined_at,
        (SELECT COUNT(*) FROM products WHERE user_id = u.id AND status = 'active') as seller_active_listings_count,
        CASE WHEN EXISTS (
          SELECT 1 FROM favorites WHERE product_id = p.id AND user_id = ?
        ) THEN 1 ELSE 0 END as is_favorited
      FROM products p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(currentUserId, productId);

    if (!product) {
      return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }

    // Parse extra details if JSON
    if (product.extra_details) {
      try {
        product.extra_details = JSON.parse(product.extra_details);
      } catch (e) {
        // Keep string
      }
    }

    // Get images
    const images = db.prepare('SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC').all(productId);
    product.images = images;

    // Get similar products from same category
    const similarProducts = db.prepare(`
      SELECT 
        p.id, p.title, p.price, p.currency, p.location, p.created_at, p.condition, p.is_vip, p.is_urgent,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      ORDER BY p.is_vip DESC, p.created_at DESC
      LIMIT 4
    `).all(product.category_id, productId);
    product.similar = similarProducts;

    return res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    return res.status(500).json({ error: 'Mahsulotni yuklashda xatolik yuz berdi' });
  }
});

// POST /api/products - create product
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      price,
      currency = 'UZS',
      condition = 'used',
      location,
      images = [], // Array of image URLs
      is_vip = 0,
      is_top = 0,
      is_urgent = 0,
      old_price = 0,
      video_url = '',
      extra_details = null,
      lat = null,
      lng = null
    } = req.body;

    if (!title || !description || !category_id || price === undefined || !location) {
      return res.status(400).json({ error: 'Barcha zarur maydonlarni to\'ldiring (nomi, tavsifi, kategoriya, narxi, joylashuv)' });
    }

    const validImages = Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.trim().length > 0) : [];
    if (validImages.length < 3) {
      return res.status(400).json({ error: 'E\'lon joylashtirish uchun kamida 3 ta rasm yuklashingiz shart! (Hozir yuklangan: ' + validImages.length + ' ta)' });
    }

    const extraDetailsStr = extra_details ? (typeof extra_details === 'object' ? JSON.stringify(extra_details) : String(extra_details)) : null;

    const result = db.prepare(`
      INSERT INTO products (
        user_id, category_id, title, description, price, currency, condition, location,
        is_vip, is_top, is_urgent, old_price, video_url, extra_details, lat, lng
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      parseInt(category_id),
      title.trim(),
      description.trim(),
      parseFloat(price),
      currency,
      condition,
      location.trim(),
      is_vip ? 1 : 0,
      is_top ? 1 : 0,
      is_urgent ? 1 : 0,
      old_price ? parseFloat(old_price) : 0,
      video_url ? video_url.trim() : null,
      extraDetailsStr,
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null
    );

    const productId = Number(result.lastInsertRowid);

    // Insert images (all >= 3 images)
    const insertImgStmt = db.prepare('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)');
    validImages.forEach((imgUrl, index) => {
      insertImgStmt.run(productId, imgUrl.trim(), index === 0 ? 1 : 0);
    });

    return res.status(201).json({
      message: 'E\'lon muvaffaqiyatli joylashtirildi',
      productId
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ error: 'E\'lon joylashtirishda xatolik yuz berdi' });
  }
});

// PUT /api/products/:id - edit product
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    if (!existing) {
      return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }

    // Only owner or admin can edit
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu e\'lonni tahrirlashga huquqingiz yo\'q' });
    }

    const {
      title,
      description,
      category_id,
      price,
      currency,
      condition,
      location,
      status,
      images,
      is_vip,
      is_top,
      is_urgent,
      old_price,
      video_url,
      extra_details,
      lat,
      lng
    } = req.body;

    const extraDetailsStr = extra_details !== undefined ? (typeof extra_details === 'object' ? JSON.stringify(extra_details) : String(extra_details)) : existing.extra_details;

    db.prepare(`
      UPDATE products 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        currency = COALESCE(?, currency),
        condition = COALESCE(?, condition),
        location = COALESCE(?, location),
        status = COALESCE(?, status),
        is_vip = COALESCE(?, is_vip),
        is_top = COALESCE(?, is_top),
        is_urgent = COALESCE(?, is_urgent),
        old_price = COALESCE(?, old_price),
        video_url = COALESCE(?, video_url),
        extra_details = COALESCE(?, extra_details),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      description ? description.trim() : null,
      category_id ? parseInt(category_id) : null,
      price !== undefined ? parseFloat(price) : null,
      currency || null,
      condition || null,
      location ? location.trim() : null,
      status || null,
      is_vip !== undefined ? (is_vip ? 1 : 0) : null,
      is_top !== undefined ? (is_top ? 1 : 0) : null,
      is_urgent !== undefined ? (is_urgent ? 1 : 0) : null,
      old_price !== undefined ? parseFloat(old_price) : null,
      video_url !== undefined ? video_url : null,
      extraDetailsStr,
      lat !== undefined ? parseFloat(lat) : null,
      lng !== undefined ? parseFloat(lng) : null,
      productId
    );

    // Update images if provided
    if (Array.isArray(images) && images.length > 0) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
      const insertImgStmt = db.prepare('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)');
      images.forEach((imgUrl, index) => {
        if (imgUrl && typeof imgUrl === 'string') {
          insertImgStmt.run(productId, imgUrl.trim(), index === 0 ? 1 : 0);
        }
      });
    }

    return res.json({ message: 'E\'lon muvaffaqiyatli yangilandi' });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ error: 'E\'lonni yangilashda xatolik yuz berdi' });
  }
});

// DELETE /api/products/:id - delete product
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    if (!existing) {
      return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }

    // Only owner or admin can delete
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu e\'lonni o\'chirishga huquqingiz yo\'q' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);

    return res.json({ message: 'E\'lon muvaffaqiyatli o\'chirildi' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: 'E\'lonni o\'chirishda xatolik yuz berdi' });
  }
});

module.exports = router;
