// ============================================
// API Service Client for DEBESMSCAT Frontend
// ============================================
// This file handles all communication with the backend API

class APIClient {
  constructor(baseURL = APIClient.getDefaultBaseURL()) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken') || null;
  }

  static getDefaultBaseURL() {
    if (typeof window !== 'undefined' && window.location.origin !== 'null') {
      return `${window.location.origin}/api/v1`;
    }

    return 'http://localhost:5000/api/v1';
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Register new user
   */
  async register(fullName, email, password, userType = 'customer') {
    return this.post('/auth/register', {
      fullName,
      email,
      password,
      userType,
    });
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    const response = await this.post('/auth/logout', {});
    this.clearToken();
    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(token) {
    return this.post('/auth/refresh-token', { token });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    return this.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.get('/users/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(fullName, phone, bio, avatarUrl) {
    return this.put('/users/profile', {
      fullName,
      phone,
      bio,
      avatarUrl,
    });
  }

  /**
   * Get user addresses
   */
  async getAddresses() {
    return this.get('/users/addresses');
  }

  /**
   * Add new address
   */
  async addAddress(label, addressLine1, addressLine2, city, province, postalCode, isDefault = false) {
    return this.post('/users/addresses', {
      label,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      isDefault,
    });
  }

  /**
   * Update address
   */
  async updateAddress(addressId, updatedData) {
    return this.put(`/users/addresses/${addressId}`, updatedData);
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId) {
    return this.delete(`/users/addresses/${addressId}`);
  }

  /**
   * Get user orders
   */
  async getUserOrders(status = null, page = 1, limit = 10) {
    let url = `/users/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return this.get(url);
  }

  // ==================== PRODUCTS ====================

  /**
   * Get all products
   */
  async getProducts(page = 1, limit = 20, sortBy = 'created_at', order = 'DESC') {
    return this.get(`/products?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`);
  }

  /**
   * Search products
   */
  async searchProducts(query, category = null, minPrice = null, maxPrice = null, page = 1, limit = 20) {
    let url = `/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    return this.get(url);
  }

  /**
   * Get product by ID
   */
  async getProduct(productId) {
    return this.get(`/products/${productId}`);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category, page = 1, limit = 20) {
    return this.get(`/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`);
  }

  /**
   * Create product (seller only)
   */
  async createProduct(productName, price, stock, category, description, images = []) {
    return this.post('/products', {
      productName,
      price,
      stock,
      category,
      description,
      images,
    });
  }

  /**
   * Update product (seller only)
   */
  async updateProduct(productId, updatedData) {
    return this.put(`/products/${productId}`, updatedData);
  }

  /**
   * Delete product (seller only)
   */
  async deleteProduct(productId) {
    return this.delete(`/products/${productId}`);
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId, page = 1, limit = 10) {
    return this.get(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
  }

  /**
   * Add product review
   */
  async addProductReview(productId, rating, comment) {
    return this.post(`/products/${productId}/reviews`, {
      rating,
      comment,
    });
  }

  // ==================== SELLERS ====================

  /**
   * Get all sellers
   */
  async getSellers(page = 1, limit = 10, status = 'Approved') {
    return this.get(`/sellers?page=${page}&limit=${limit}&status=${status}`);
  }

  /**
   * Get seller details
   */
  async getSeller(sellerId) {
    return this.get(`/sellers/${sellerId}`);
  }

  /**
   * Get seller products
   */
  async getSellerProducts(sellerId, page = 1, limit = 10) {
    return this.get(`/sellers/${sellerId}/products?page=${page}&limit=${limit}`);
  }

  /**
   * Register as seller
   */
  async registerSeller(fullName, email, password, phone, storeName, category, location, description) {
    return this.post('/sellers/register', {
      fullName,
      email,
      password,
      phone,
      storeName,
      category,
      location,
      description,
    });
  }

  /**
   * Get seller dashboard (authenticated seller only)
   */
  async getSellerDashboard(sellerId) {
    return this.get(`/sellers/${sellerId}/dashboard`);
  }

  /**
   * Update seller info
   */
  async updateSellerInfo(sellerId, updatedData) {
    return this.put(`/sellers/${sellerId}`, updatedData);
  }

  /**
   * Get seller analytics
   */
  async getSellerAnalytics(sellerId) {
    return this.get(`/sellers/${sellerId}/analytics`);
  }

  // ==================== ORDERS ====================

  /**
   * Get user orders
   */
  async getOrders(page = 1, limit = 10) {
    return this.get(`/orders?page=${page}&limit=${limit}`);
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  /**
   * Create new order
   */
  async createOrder(items, shippingAddressId, notes = '') {
    return this.post('/orders', {
      items, // Array of { productId, quantity }
      shippingAddressId,
      notes,
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return this.put(`/orders/${orderId}/cancel`, {});
  }

  /**
   * Get order tracking info
   */
  async getOrderTracking(orderId) {
    return this.get(`/orders/${orderId}/tracking`);
  }

  /**
   * Checkout (prepare for payment)
   */
  async checkout(items, shippingAddressId) {
    return this.post('/orders/checkout', {
      items,
      shippingAddressId,
    });
  }

  /**
   * Confirm payment
   */
  async confirmPayment(orderId, paymentMethodId) {
    return this.post('/orders/payment-confirm', {
      orderId,
      paymentMethodId,
    });
  }

  // ==================== ADMIN ====================

  /**
   * Get all sellers (admin only)
   */
  async adminGetAllSellers(page = 1, limit = 10) {
    return this.get(`/admin/sellers?page=${page}&limit=${limit}`);
  }

  /**
   * Get pending sellers (admin only)
   */
  async adminGetPendingSellers(page = 1, limit = 10) {
    return this.get(`/admin/sellers/pending?page=${page}&limit=${limit}`);
  }

  /**
   * Approve seller (admin only)
   */
  async adminApproveSeller(sellerId) {
    return this.put(`/admin/sellers/${sellerId}/approve`, {});
  }

  /**
   * Reject seller (admin only)
   */
  async adminRejectSeller(sellerId, reason) {
    return this.put(`/admin/sellers/${sellerId}/reject`, { reason });
  }

  /**
   * Get all users (admin only)
   */
  async adminGetAllUsers(page = 1, limit = 10) {
    return this.get(`/admin/users?page=${page}&limit=${limit}`);
  }

  /**
   * Get dashboard analytics (admin only)
   */
  async adminGetDashboardAnalytics() {
    return this.get('/admin/analytics/dashboard');
  }

  /**
   * Get sales analytics (admin only)
   */
  async adminGetSalesAnalytics(period = 'month') {
    return this.get(`/admin/analytics/sales?period=${period}`);
  }

  /**
   * Get user analytics (admin only)
   */
  async adminGetUserAnalytics() {
    return this.get('/admin/analytics/users');
  }

  /**
   * Get system status (admin only)
   */
  async adminGetSystemStatus() {
    return this.get('/admin/system-status');
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.token !== null;
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  /**
   * Make GET request
   */
  async get(endpoint, headers = {}) {
    return this.request('GET', endpoint, null, headers);
  }

  /**
   * Make POST request
   */
  async post(endpoint, data, headers = {}) {
    return this.request('POST', endpoint, data, headers);
  }

  /**
   * Make PUT request
   */
  async put(endpoint, data, headers = {}) {
    return this.request('PUT', endpoint, data, headers);
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint, headers = {}) {
    return this.request('DELETE', endpoint, null, headers);
  }

  /**
   * Generic request method
   */
  async request(method, endpoint, data = null, headers = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...headers,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || `HTTP ${response.status}`);
      }

      return json;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error.message);
      return {
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create global instance
const api = new APIClient();

// Export for use in modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIClient;
}
