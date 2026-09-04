const db = require('../config/database');
const bcrypt = require('bcryptjs');
const validator = require('validator');

/**
 * Get All Sellers
 */
exports.getAllSellers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'Approved' } = req.query;

    const sellers = await db.manyOrNone(
      `SELECT id, store_name, description, location, category, rating, reviews_count, created_at
       FROM sellers WHERE status = $1 ORDER BY rating DESC LIMIT $2 OFFSET $3`,
      [status, limit, (page - 1) * limit]
    );

    res.status(200).json({
      success: true,
      sellers,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Seller By ID
 */
exports.getSellerById = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const seller = await db.oneOrNone(
      `SELECT id, user_id, store_name, description, location, category, phone, email, rating, reviews_count, total_sales, created_at
       FROM sellers WHERE id = $1`,
      [sellerId]
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register Seller
 */
exports.registerSeller = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, storeName, category, location, description } = req.body;

    if (!fullName || !email || !password || !phone || !storeName || !category || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'All seller registration fields are required',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.oneOrNone(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await db.tx(async (transaction) => {
      const user = await transaction.one(
        `INSERT INTO users (full_name, email, password, phone, role, created_at)
         VALUES ($1, $2, $3, $4, 'seller', NOW())
         RETURNING id`,
        [fullName.trim(), normalizedEmail, hashedPassword, phone.trim()]
      );

      return transaction.one(
        `INSERT INTO sellers (user_id, store_name, category, location, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'Pending', NOW())
         RETURNING id, store_name, category, location, status`,
        [user.id, storeName.trim(), category, location.trim(), description.trim()]
      );
    });

    res.status(201).json({
      success: true,
      message: 'Seller registration submitted. Awaiting admin approval.',
      seller,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Seller Dashboard
 */
exports.getSellerDashboard = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const userId = req.user.userId;

    // Verify seller owns this dashboard
    const seller = await db.oneOrNone(
      'SELECT id FROM sellers WHERE id = $1 AND user_id = $2',
      [sellerId, userId]
    );

    if (!seller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const stats = await db.one(
      `SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as average_rating
       FROM sellers s
       LEFT JOIN products p ON s.id = p.seller_id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE s.id = $1`,
      [sellerId]
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Seller Info
 */
exports.updateSellerInfo = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { storeName, description, location, category } = req.body;

    const seller = await db.one(
      `UPDATE sellers 
       SET store_name = COALESCE($1, store_name),
           description = COALESCE($2, description),
           location = COALESCE($3, location),
           category = COALESCE($4, category),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, store_name, description, location, category`,
      [storeName, description, location, category, sellerId]
    );

    res.status(200).json({
      success: true,
      message: 'Seller information updated',
      seller,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Seller Products
 */
exports.getSellerProducts = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const products = await db.manyOrNone(
      `SELECT id, product_name, price, stock, rating, reviews_count, created_at
       FROM products WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [sellerId, limit, (page - 1) * limit]
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
 * Get Seller Analytics
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const analytics = await db.one(
      `SELECT 
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
       FROM sellers s
       LEFT JOIN products p ON s.id = p.seller_id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id
       WHERE s.id = $1`,
      [sellerId]
    );

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};
