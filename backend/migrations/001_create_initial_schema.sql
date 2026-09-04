-- DEBESMSCAT Shopping System Database Schema
-- PostgreSQL Migration Script

-- ===========================
-- 1. USERS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  bio TEXT,
  role VARCHAR(50) DEFAULT 'customer', -- customer, seller, admin
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ===========================
-- 2. SELLERS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Suspended
  rejection_reason TEXT,
  commission_rate DECIMAL(5, 2) DEFAULT 5,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_category ON sellers(category);
CREATE INDEX idx_sellers_user_id ON sellers(user_id);

-- ===========================
-- 3. PRODUCTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2),
  discount_percentage DECIMAL(5, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  images JSON, -- Array of image URLs
  sku VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Pending, Rejected
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_product_name ON products(product_name);

-- ===========================
-- 4. REVIEWS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  order_item_id INTEGER,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  images JSON, -- Array of review image URLs
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Approved', -- Pending, Approved, Rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ===========================
-- 5. SHOPPING CART TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS shopping_carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);

-- ===========================
-- 6. CART ITEMS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- ===========================
-- 7. USER ADDRESSES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  label VARCHAR(100), -- Home, Office, etc.
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Philippines',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(is_default);

-- ===========================
-- 8. ORDERS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  seller_id INTEGER,
  shipping_address_id INTEGER,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(100), -- Credit Card, Debit Card, GCash, etc.
  payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid, Failed, Refunded
  order_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE SET NULL,
  FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ===========================
-- 9. ORDER ITEMS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL, -- Price at time of purchase
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ===========================
-- 10. ORDER TRACKING TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS order_tracking (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL, -- Processing, Shipped, In Transit, Delivered
  location VARCHAR(255),
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX idx_order_tracking_status ON order_tracking(status);

-- ===========================
-- 11. WISHLIST TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- ===========================
-- 12. PAYMENTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  transaction_id VARCHAR(255) UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(100),
  payment_gateway VARCHAR(100), -- Stripe, PayMongo, GCash, etc.
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Success, Failed, Cancelled
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ===========================
-- 13. NOTIFICATIONS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- order_status, seller_update, promotion, etc.
  related_id INTEGER, -- order_id, product_id, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ===========================
-- 14. TRANSACTIONS TABLE (for seller earnings)
-- ===========================
CREATE TABLE IF NOT EXISTS seller_transactions (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL,
  order_id INTEGER,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type VARCHAR(50), -- sale, refund, withdrawal
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Failed
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_seller_transactions_seller_id ON seller_transactions(seller_id);
CREATE INDEX idx_seller_transactions_status ON seller_transactions(status);

-- ===========================
-- 15. ADMIN LOGS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER,
  action VARCHAR(100),
  entity_type VARCHAR(100), -- seller, product, user, order, etc.
  entity_id INTEGER,
  changes JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- ===========================
-- 16. PROMOTIONS/COUPONS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(50), -- percentage, fixed
  discount_value DECIMAL(12, 2) NOT NULL,
  min_purchase DECIMAL(12, 2),
  max_discount DECIMAL(12, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);

-- ===========================
-- 17. REPORTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL,
  reported_type VARCHAR(50), -- seller, product, user, review, etc.
  reported_id INTEGER,
  reason VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Under Review, Resolved, Dismissed
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_type ON reports(reported_type);

-- ===========================
-- TRIGGER: Update user updated_at
-- ===========================
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- Similar triggers for other tables with updated_at
CREATE TRIGGER seller_update_timestamp
BEFORE UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

CREATE TRIGGER product_update_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

CREATE TRIGGER order_update_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- ===========================
-- VIEWS for Analytics
-- ===========================

-- Seller Summary View
CREATE OR REPLACE VIEW seller_summary AS
SELECT 
  s.id,
  s.store_name,
  s.status,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT o.id) as order_count,
  COALESCE(SUM(o.total_price), 0) as total_revenue,
  COALESCE(AVG(r.rating), 0) as average_rating
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id
LEFT JOIN orders o ON s.id = o.seller_id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY s.id;

-- Product Performance View
CREATE OR REPLACE VIEW product_performance AS
SELECT 
  p.id,
  p.product_name,
  p.seller_id,
  p.price,
  p.stock,
  p.sold_count,
  COUNT(DISTINCT r.id) as review_count,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(DISTINCT w.id) as wishlist_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN wishlists w ON p.id = w.product_id
GROUP BY p.id;

-- Revenue by Seller View
CREATE OR REPLACE VIEW seller_revenue_summary AS
SELECT 
  s.id,
  s.store_name,
  DATE_TRUNC('month', o.created_at) as month,
  COUNT(DISTINCT o.id) as order_count,
  COALESCE(SUM(o.total_price), 0) as total_revenue,
  COALESCE(SUM(o.total_price * s.commission_rate / 100), 0) as commission
FROM sellers s
LEFT JOIN orders o ON s.id = o.seller_id
GROUP BY s.id, DATE_TRUNC('month', o.created_at);

-- ===========================
-- INITIAL DATA (Optional)
-- ===========================

-- Default admin user (password: admin123)
INSERT INTO users (full_name, email, password, role, email_verified, verified_at)
VALUES (
  'System Admin',
  'admin@debesmscat.edu.ph',
  '$2a$10$r4MZtXYcx2zrG7VG1v7v.OU8VqJsH6xFx.c1Wj8YZ7z.MvPfDlRJK', -- bcrypt hash of 'admin123'
  'admin',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Sample categories (can be used for filtering)
-- These are typically handled via code, but here for reference
-- INSERT INTO categories (name, description) VALUES ...
