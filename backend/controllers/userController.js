const db = require('../config/database');

/**
 * Get User Profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await db.oneOrNone(
      `SELECT id, full_name, email, phone, avatar_url, bio, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, bio, avatarUrl } = req.body;

    const user = await db.one(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           bio = COALESCE($3, bio),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, full_name, email, phone, avatar_url, bio`,
      [fullName, phone, bio, avatarUrl, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Addresses
 */
exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const addresses = await db.manyOrNone(
      `SELECT id, label, address_line_1, address_line_2, city, province, postal_code, is_default
       FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Address
 */
exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { label, addressLine1, addressLine2, city, province, postalCode, isDefault } = req.body;

    if (!label || !addressLine1 || !city || !province) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing',
      });
    }

    const address = await db.one(
      `INSERT INTO user_addresses (user_id, label, address_line_1, address_line_2, city, province, postal_code, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, label, address_line_1, address_line_2, city, province, postal_code, is_default`,
      [userId, label, addressLine1, addressLine2, city, province, postalCode, isDefault || false]
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Address
 */
exports.updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const { label, addressLine1, addressLine2, city, province, postalCode, isDefault } = req.body;

    const address = await db.one(
      `UPDATE user_addresses 
       SET label = COALESCE($1, label),
           address_line_1 = COALESCE($2, address_line_1),
           address_line_2 = COALESCE($3, address_line_2),
           city = COALESCE($4, city),
           province = COALESCE($5, province),
           postal_code = COALESCE($6, postal_code),
           is_default = COALESCE($7, is_default),
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING id, label, address_line_1, address_line_2, city, province, postal_code, is_default`,
      [label, addressLine1, addressLine2, city, province, postalCode, isDefault, addressId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Address
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    await db.none(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    let query = 'SELECT * FROM orders WHERE user_id = $1';
    const params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    const orders = await db.manyOrNone(
      query + ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2),
      [...params, limit, (page - 1) * limit]
    );

    res.status(200).json({
      success: true,
      orders,
      pagination: { page, limit },
    });
  } catch (error) {
    next(error);
  }
};
