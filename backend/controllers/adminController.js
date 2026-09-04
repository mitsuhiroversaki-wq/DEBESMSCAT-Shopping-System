const db = require('../config/database');

/**
 * Get All Sellers
 */
exports.getAllSellers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sellers = await db.manyOrNone(
      `SELECT s.id, s.store_name, s.status, u.email, u.phone, s.rating, s.created_at
       FROM sellers s JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit]
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
 * Get Pending Sellers
 */
exports.getPendingSellers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sellers = await db.manyOrNone(
      `SELECT s.id, s.store_name, s.category, u.full_name, u.email, u.phone, s.created_at
       FROM sellers s JOIN users u ON s.user_id = u.id
       WHERE s.status = 'Pending'
       ORDER BY s.created_at ASC LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit]
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
 * Approve Seller
 */
exports.approveSeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const seller = await db.one(
      `UPDATE sellers SET status = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, store_name, status`,
      ['Approved', sellerId]
    );

    res.status(200).json({
      success: true,
      message: 'Seller approved successfully',
      seller,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Seller
 */
exports.rejectSeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { reason } = req.body;

    await db.none(
      `UPDATE sellers SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`,
      ['Rejected', reason, sellerId]
    );

    res.status(200).json({
      success: true,
      message: 'Seller rejected',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Seller
 */
exports.deleteSeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    await db.none('DELETE FROM sellers WHERE id = $1', [sellerId]);

    res.status(200).json({
      success: true,
      message: 'Seller deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await db.manyOrNone(
      `SELECT id, full_name, email, phone, role, created_at FROM users
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit]
    );

    res.status(200).json({
      success: true,
      users,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await db.none('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Pending Products
 */
exports.getPendingProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await db.manyOrNone(
      `SELECT p.id, p.product_name, p.price, s.store_name, p.created_at
       FROM products p JOIN sellers s ON p.seller_id = s.id
       WHERE p.status = 'Pending'
       ORDER BY p.created_at ASC LIMIT $1 OFFSET $2`,
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
 * Approve Product
 */
exports.approveProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await db.none(
      'UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2',
      ['Approved', productId]
    );

    res.status(200).json({
      success: true,
      message: 'Product approved',
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
      message: 'Product deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dashboard Analytics
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const stats = await db.one(
      `SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT s.id) as total_sellers,
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_price), 0) as total_revenue
       FROM users u
       LEFT JOIN sellers s ON u.role = 'seller'
       LEFT JOIN products p ON s.id = p.seller_id
       LEFT JOIN orders o ON u.id = o.user_id`
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
 * Get Sales Analytics
 */
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    const analytics = await db.manyOrNone(
      `SELECT DATE_TRUNC($1, o.created_at) as period, 
              COUNT(DISTINCT o.id) as order_count,
              COALESCE(SUM(o.total_price), 0) as revenue
       FROM orders o
       WHERE o.status IN ('Processing', 'Delivered')
       GROUP BY DATE_TRUNC($1, o.created_at)
       ORDER BY period DESC`,
      [period]
    );

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Analytics
 */
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const analytics = await db.one(
      `SELECT 
        COUNT(u.id) as total_users,
        COUNT(CASE WHEN u.role = 'seller' THEN 1 END) as seller_count,
        COUNT(CASE WHEN u.role = 'customer' THEN 1 END) as customer_count,
        COUNT(CASE WHEN u.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
       FROM users u`
    );

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get System Status
 */
exports.getSystemStatus = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      status: {
        api: 'running',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
