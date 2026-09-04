const db = require('../config/database');

/**
 * Get All Products
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } = req.query;

    const products = await db.manyOrNone(
      `SELECT id, product_name, price, stock, seller_id, category, rating, reviews_count, created_at
       FROM products WHERE stock > 0 ORDER BY ${sortBy} ${order} LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit]
    );

    res.status(200).json({
      success: true,
      products,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search Products
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    let query = `SELECT id, product_name, price, stock, seller_id, category, rating, reviews_count
                 FROM products WHERE 1=1`;
    const params = [];

    if (q) {
      query += ` AND product_name ILIKE $${params.length + 1}`;
      params.push(`%${q}%`);
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (minPrice) {
      query += ` AND price >= $${params.length + 1}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND price <= $${params.length + 1}`;
      params.push(maxPrice);
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const products = await db.manyOrNone(query, params);

    res.status(200).json({
      success: true,
      products,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Product By ID
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await db.oneOrNone(
      `SELECT id, product_name, price, stock, seller_id, category, description, rating, reviews_count, images, created_at
       FROM products WHERE id = $1`,
      [productId]
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Products By Category
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const products = await db.manyOrNone(
      `SELECT id, product_name, price, stock, seller_id, rating, reviews_count
       FROM products WHERE category = $1 AND stock > 0 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [category, limit, (page - 1) * limit]
    );

    res.status(200).json({
      success: true,
      products,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Product
 */
exports.createProduct = async (req, res, next) => {
  try {
    const sellerId = req.user.userId; // Should be mapped to seller
    const { productName, price, stock, category, description, images } = req.body;

    if (!productName || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing',
      });
    }

    const product = await db.one(
      `INSERT INTO products (seller_id, product_name, price, stock, category, description, images, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, product_name, price, stock, category, description`,
      [sellerId, productName, price, stock, category, description, JSON.stringify(images || [])]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Product
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { productName, price, stock, category, description, images } = req.body;

    const product = await db.one(
      `UPDATE products 
       SET product_name = COALESCE($1, product_name),
           price = COALESCE($2, price),
           stock = COALESCE($3, stock),
           category = COALESCE($4, category),
           description = COALESCE($5, description),
           images = COALESCE($6, images),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, product_name, price, stock, category, description`,
      [productName, price, stock, category, description, images ? JSON.stringify(images) : null, productId]
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Product
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await db.none('DELETE FROM products WHERE id = $1', [productId]);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Review
 */
exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required',
      });
    }

    const review = await db.one(
      `INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, rating, comment, created_at`,
      [productId, userId, rating, comment]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reviews
 */
exports.getReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await db.manyOrNone(
      `SELECT r.id, r.rating, r.comment, u.full_name, r.created_at
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
      [productId, limit, (page - 1) * limit]
    );

    res.status(200).json({
      success: true,
      reviews,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};
