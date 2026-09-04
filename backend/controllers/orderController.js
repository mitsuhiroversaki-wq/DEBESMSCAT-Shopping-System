const db = require('../config/database');

/**
 * Get Orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    let query = 'SELECT id, order_number, total_price, status, created_at FROM orders WHERE user_id = $1';
    const params = [userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const orders = await db.manyOrNone(query, params);

    res.status(200).json({
      success: true,
      orders,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Order By ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await db.oneOrNone(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const items = await db.manyOrNone(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.product_name
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      order: { ...order, items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddressId, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    // Calculate total
    let totalPrice = 0;
    for (const item of items) {
      const product = await db.oneOrNone(
        'SELECT price FROM products WHERE id = $1',
        [item.productId]
      );
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }
      totalPrice += product.price * item.quantity;
    }

    // Create order
    const order = await db.one(
      `INSERT INTO orders (user_id, shipping_address_id, total_price, status, notes, created_at)
       VALUES ($1, $2, $3, 'Pending', $4, NOW())
       RETURNING id, order_number, total_price, status`,
      [userId, shippingAddressId, totalPrice, notes]
    );

    // Add order items
    for (const item of items) {
      await db.none(
        `INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
         VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2), NOW())`,
        [order.id, item.productId, item.quantity]
      );

      // Update product stock
      await db.none(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Order
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await db.oneOrNone(
      'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status',
      });
    }

    // Get order items to restore stock
    const items = await db.manyOrNone(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    // Restore stock
    for (const item of items) {
      await db.none(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Update order status
    await db.none(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      ['Cancelled', orderId]
    );

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Tracking Info
 */
exports.getTrackingInfo = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const tracking = await db.oneOrNone(
      `SELECT id, order_id, status, location, updated_at
       FROM order_tracking WHERE order_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      tracking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Checkout
 */
exports.checkout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddressId } = req.body;

    // Create order
    const order = await exports.createOrder({ user: { userId }, body: { items, shippingAddressId } }, res, next);

    res.status(200).json({
      success: true,
      message: 'Proceed to payment',
      orderId: order.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm Payment
 */
exports.confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethodId } = req.body;

    if (!orderId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payment method are required',
      });
    }

    // Update order status
    await db.none(
      'UPDATE orders SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3',
      ['Processing', 'Paid', orderId]
    );

    res.status(200).json({
      success: true,
      message: 'Payment confirmed. Order is being processed.',
    });
  } catch (error) {
    next(error);
  }
};
