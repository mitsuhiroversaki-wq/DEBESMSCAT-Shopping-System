# Frontend API Integration Guide

## 📚 Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [API Client Usage](#api-client-usage)
- [Common Tasks](#common-tasks)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Setup

### 1. Include the API Client

Add this to your HTML file (before your other scripts):

```html
<!-- API Service -->
<script src="js/api.js"></script>

<!-- Your application scripts -->
<script src="js/script.js"></script>
<script src="js/management.js"></script>
```

### 2. Configure Backend URL

By default, the API client connects to `http://localhost:5000/api/v1`. To change this:

```javascript
// Create a custom API client instance
const api = new APIClient('http://your-backend-url.com/api/v1');
```

### 3. Environment Configuration

Create a `config.js` file for environment-specific settings:

```javascript
// config.js
const CONFIG = {
  development: {
    apiUrl: 'http://localhost:5000/api/v1',
    timeout: 30000,
  },
  production: {
    apiUrl: 'https://api.debesmscat.com/api/v1',
    timeout: 30000,
  },
};

const ENV = process.env.NODE_ENV || 'development';
const API_URL = CONFIG[ENV].apiUrl;

// Initialize API client
const api = new APIClient(API_URL);
```

---

## Authentication

### Register User

```javascript
async function registerUser() {
  const response = await api.register(
    'John Doe',                    // fullName
    'john@example.com',            // email
    'securePassword123',           // password
    'customer'                     // userType: 'customer', 'seller', or 'admin'
  );

  if (response.success) {
    console.log('Registration successful!');
    console.log('Token:', response.token);
    console.log('User:', response.user);
  } else {
    console.error('Registration failed:', response.message);
  }
}
```

### Login User

```javascript
async function loginUser() {
  const response = await api.login(
    'john@example.com',
    'securePassword123'
  );

  if (response.success) {
    console.log('Login successful!');
    console.log('User:', response.user);
    
    // Token is automatically saved to localStorage
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } else {
    console.error('Login failed:', response.message);
    // Show error to user
  }
}
```

### Logout User

```javascript
async function logoutUser() {
  const response = await api.logout();
  
  if (response.success) {
    // Token is cleared from localStorage
    window.location.href = '/index.html';
  }
}
```

### Check Authentication Status

```javascript
if (api.isAuthenticated()) {
  console.log('User is logged in');
} else {
  console.log('User is not logged in - redirect to login page');
  window.location.href = '/login.html';
}
```

---

## API Client Usage

### User Profile

```javascript
// Get user profile
const profile = await api.getProfile();

// Update user profile
const updated = await api.updateProfile(
  'Jane Doe',                    // fullName
  '09123456789',                 // phone
  'I love shopping!',            // bio
  'https://cdn.example.com/avatar.jpg'  // avatarUrl
);
```

### User Addresses

```javascript
// Get all addresses
const addresses = await api.getAddresses();

// Add new address
const newAddress = await api.addAddress(
  'Home',                    // label
  '123 Main Street',        // addressLine1
  'Apt 4B',                 // addressLine2
  'Makati City',            // city
  'Metro Manila',           // province
  '1234',                   // postalCode
  true                      // isDefault
);

// Update address
const updated = await api.updateAddress(addressId, {
  addressLine1: '456 New Street',
  city: 'Quezon City',
});

// Delete address
await api.deleteAddress(addressId);
```

### Products

```javascript
// Get all products with pagination
const products = await api.getProducts(
  1,                // page
  20,               // limit per page
  'price',          // sortBy: 'price', 'rating', 'created_at'
  'ASC'             // order: 'ASC' or 'DESC'
);

// Search products
const results = await api.searchProducts(
  'laptop',         // query
  'Electronics',    // category (optional)
  10000,            // minPrice (optional)
  50000,            // maxPrice (optional)
  1,                // page
  20                // limit
);

// Get specific product
const product = await api.getProduct(productId);

// Get products by category
const category = await api.getProductsByCategory('Food & Snacks', 1, 20);
```

### Product Reviews

```javascript
// Get reviews for a product
const reviews = await api.getProductReviews(productId, 1, 10);

// Add review (customer only)
const review = await api.addProductReview(
  productId,
  5,                // rating (1-5)
  'Amazing product!'  // comment
);
```

### Sellers

```javascript
// Get all approved sellers
const sellers = await api.getSellers(1, 10, 'Approved');

// Get seller details
const seller = await api.getSeller(sellerId);

// Get seller's products
const products = await api.getSellerProducts(sellerId, 1, 20);

// Register as seller
const registration = await api.registerSeller(
  'Maria Santos',
  'maria@example.com',
  'secure-password',
  '09123456789',
  'MRS Corner',
  'Food & Snacks',
  'Main Gate',
  'Fresh snacks and drinks'
);

// Get seller dashboard (if authenticated as seller)
const dashboard = await api.getSellerDashboard(sellerId);

// Get seller analytics
const analytics = await api.getSellerAnalytics(sellerId);
```

### Orders & Shopping

```javascript
// Get user orders
const orders = await api.getOrders(1, 10);

// Get specific order
const order = await api.getOrder(orderId);

// Create new order
const newOrder = await api.createOrder(
  [
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 }
  ],                                    // items array
  addressId,                            // shippingAddressId
  'Please deliver in the morning'       // notes (optional)
);

// Cancel order
const cancelled = await api.cancelOrder(orderId);

// Get tracking info
const tracking = await api.getOrderTracking(orderId);

// Checkout process
const checkout = await api.checkout(
  [
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 }
  ],
  addressId
);

// Confirm payment after payment gateway processing
const payment = await api.confirmPayment(orderId, paymentMethodId);
```

### Admin Functions

```javascript
// Get all sellers
const sellers = await api.adminGetAllSellers(1, 10);

// Get pending sellers (need approval)
const pending = await api.adminGetPendingSellers(1, 10);

// Approve seller
await api.adminApproveSeller(sellerId);

// Reject seller
await api.adminRejectSeller(sellerId, 'Insufficient documentation');

// Get all users
const users = await api.adminGetAllUsers(1, 10);

// Get dashboard analytics
const dashboard = await api.adminGetDashboardAnalytics();

// Get sales analytics
const sales = await api.adminGetSalesAnalytics('month'); // 'day', 'month', 'year'

// Get user analytics
const userStats = await api.adminGetUserAnalytics();

// Get system status
const status = await api.adminGetSystemStatus();
```

---

## Common Tasks

### 1. Load Products on Page

```javascript
async function loadProducts() {
  const response = await api.getProducts(1, 20);
  
  if (response.success) {
    const products = response.products;
    
    // Display products in UI
    const container = document.getElementById('productsContainer');
    container.innerHTML = products.map(product => `
      <div class="product-card">
        <h3>${product.product_name}</h3>
        <p>₱${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <button onclick="viewProduct(${product.id})">View Details</button>
      </div>
    `).join('');
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadProducts);
```

### 2. Complete Order Checkout Flow

```javascript
async function completeCheckout() {
  try {
    // 1. Get selected items from cart
    const cartItems = getCartItems(); // Your cart logic
    const addressId = document.getElementById('shippingAddress').value;

    // 2. Create order
    const orderResponse = await api.createOrder(
      cartItems,
      addressId,
      'Special instructions here'
    );

    if (!orderResponse.success) {
      throw new Error(orderResponse.message);
    }

    const orderId = orderResponse.order.id;
    console.log('Order created:', orderId);

    // 3. Process payment (integrate with Stripe/PayMongo)
    const paymentResult = await processPayment(orderId);

    if (paymentResult.success) {
      // 4. Confirm payment
      const confirmResponse = await api.confirmPayment(
        orderId,
        paymentResult.paymentMethodId
      );

      if (confirmResponse.success) {
        // 5. Show success and clear cart
        showSuccessMessage('Order placed successfully!');
        clearCart();
        window.location.href = `/order-confirmation.html?orderId=${orderId}`;
      }
    }
  } catch (error) {
    showErrorMessage(error.message);
  }
}
```

### 3. Load Seller Dashboard

```javascript
async function loadSellerDashboard() {
  // Get seller ID from authenticated user or URL
  const sellerId = getSellerId();
  
  const dashboard = await api.getSellerDashboard(sellerId);
  
  if (dashboard.success) {
    document.getElementById('totalProducts').textContent = dashboard.stats.total_products;
    document.getElementById('totalOrders').textContent = dashboard.stats.total_orders;
    document.getElementById('totalRevenue').textContent = `₱${dashboard.stats.total_revenue}`;
    document.getElementById('avgRating').textContent = dashboard.stats.average_rating.toFixed(2);
  }
}
```

### 4. Handle Admin Seller Approval

```javascript
async function approvePendingSeller(sellerId) {
  const response = await api.adminApproveSeller(sellerId);
  
  if (response.success) {
    showSuccessMessage('Seller approved successfully');
    // Refresh sellers list
    loadPendingSellers();
  } else {
    showErrorMessage(response.message);
  }
}

async function loadPendingSellers() {
  const response = await api.adminGetPendingSellers(1, 10);
  
  if (response.success) {
    const container = document.getElementById('pendingSellersList');
    container.innerHTML = response.sellers.map(seller => `
      <div class="seller-item">
        <h4>${seller.store_name}</h4>
        <p>Email: ${seller.email}</p>
        <p>Category: ${seller.category}</p>
        <button onclick="approvePendingSeller(${seller.id})">Approve</button>
      </div>
    `).join('');
  }
}
```

---

## Error Handling

### Check Response Status

```javascript
async function safeApiCall() {
  try {
    const response = await api.getProducts();
    
    if (!response.success) {
      console.error('API Error:', response.message);
      showUserError(response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('Network Error:', error);
    showUserError('Network error. Please try again.');
  }
}
```

### Handle Authentication Errors

```javascript
async function getProtectedData() {
  if (!api.isAuthenticated()) {
    console.log('Not authenticated. Redirecting to login...');
    window.location.href = '/login.html';
    return;
  }

  const response = await api.getProfile();
  
  if (response.statusCode === 401) {
    // Token expired - clear and redirect to login
    api.clearToken();
    window.location.href = '/login.html';
  }
  
  return response;
}
```

### Global Error Handler

```javascript
// Add to your script.js
async function handleApiError(error) {
  console.error('API Error:', error);
  
  // Show user-friendly error message
  const errorContainer = document.getElementById('errorAlert');
  errorContainer.innerHTML = `
    <div class="alert alert-danger">
      ${error.message || 'An error occurred. Please try again.'}
      <button onclick="this.parentElement.style.display='none'">×</button>
    </div>
  `;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorContainer.innerHTML = '';
  }, 5000);
}
```

---

## Best Practices

### 1. **Token Persistence**
The API client automatically saves tokens to localStorage. On page reload, the token is restored:
```javascript
// Token is automatically restored from localStorage on page load
console.log(api.token); // Will be null if not logged in
```

### 2. **Loading States**
Always provide user feedback during API calls:
```javascript
async function loadProducts() {
  showLoadingSpinner(true);
  
  try {
    const response = await api.getProducts();
    displayProducts(response.products);
  } finally {
    showLoadingSpinner(false);
  }
}
```

### 3. **Timeout Handling**
Implement request timeouts for slow networks:
```javascript
// Add timeout wrapper
async function apiCallWithTimeout(promise, timeoutMs = 10000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}
```

### 4. **Caching Strategies**
Cache data when appropriate:
```javascript
let cachedProducts = null;

async function getProductsWithCache() {
  if (cachedProducts) {
    return cachedProducts;
  }
  
  const response = await api.getProducts();
  cachedProducts = response.products;
  
  // Clear cache after 5 minutes
  setTimeout(() => {
    cachedProducts = null;
  }, 5 * 60 * 1000);
  
  return cachedProducts;
}
```

### 5. **Debounce Search**
Prevent excessive API calls during search:
```javascript
let searchTimeout;

function onSearchInput(query) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    const results = await api.searchProducts(query);
    displayResults(results.products);
  }, 300); // Wait 300ms after user stops typing
}
```

### 6. **Role-Based UI**
Show/hide UI elements based on user role:
```javascript
async function updateUIForRole() {
  const profile = await api.getProfile();
  
  if (profile.user.role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
  } else if (profile.user.role === 'seller') {
    document.getElementById('sellerDashboard').style.display = 'block';
  }
}
```

---

## Testing the Integration

### 1. Test Backend Connection
```javascript
// Check if backend is running
const isBackendOnline = await api.healthCheck();
console.log('Backend status:', isBackendOnline ? 'Online' : 'Offline');
```

### 2. Test Authentication
```javascript
// In browser console:
api.login('john@example.com', 'password123').then(console.log);
```

### 3. Monitor API Calls
```javascript
// Add logging to all API calls
const originalRequest = api.request.bind(api);

api.request = async function(...args) {
  console.log('📤 API Call:', args);
  const result = await originalRequest(...args);
  console.log('📥 API Response:', result);
  return result;
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **404 Not Found** | Verify backend URL in `APIClient` initialization |
| **401 Unauthorized** | Check if token is valid. Try logging in again |
| **CORS Error** | Ensure backend has CORS enabled for your frontend URL |
| **Slow API** | Check network speed, implement caching, add loading states |
| **Token Lost** | Clear localStorage and log in again |
| **Response not JSON** | Verify backend is running and responding with JSON |

---

## Next Steps

1. **Update existing frontend files** to use the new API (see examples in `/examples/`)
2. **Integrate payment gateway** (Stripe/PayMongo) for order processing
3. **Add real-time notifications** using WebSockets
4. **Implement image uploads** for products and profiles

For questions or issues, refer to [backend/README.md](../../backend/README.md) for API endpoint documentation.
