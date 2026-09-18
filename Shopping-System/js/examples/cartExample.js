// ============================================
// Example: Shopping Cart Module
// ============================================
// Shows how to manage shopping cart with the API

class CartManager {
  constructor() {
    this.cartItems = this.loadCart();
    this.setupEventListeners();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.updateCartUI();
  }

  /**
   * Add product to cart
   */
  addToCart(productId, quantity = 1) {
    const existingItem = this.cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ productId, quantity });
    }
    
    this.saveCart();
    alert(`Product added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  /**
   * Update product quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  /**
   * Get cart total
   */
  getTotal() {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get item count
   */
  getItemCount() {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Update cart UI (badge, etc.)
   */
  updateCartUI() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = this.getItemCount();
      badge.style.display = this.getItemCount() > 0 ? 'block' : 'none';
    }
  }

  /**
   * Display cart contents
   */
  async displayCart() {
    const container = document.getElementById('cartItems');
    
    if (this.cartItems.length === 0) {
      container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      return;
    }

    // Fetch product details for items
    let totalPrice = 0;
    let itemsHTML = '';

    for (const item of this.cartItems) {
      const product = await api.getProduct(item.productId);
      
      if (product.success) {
        const itemTotal = product.product.price * item.quantity;
        totalPrice += itemTotal;
        
        itemsHTML += `
          <div class="cart-item">
            <img src="${product.product.images?.[0] || '/images/placeholder.jpg'}" alt="${product.product.product_name}">
            <div class="item-details">
              <h4>${product.product.product_name}</h4>
              <p class="price">₱${product.product.price}</p>
            </div>
            <div class="quantity-control">
              <button onclick="cartManager.updateQuantity(${item.productId}, ${item.quantity - 1})">−</button>
              <input type="number" value="${item.quantity}" onchange="cartManager.updateQuantity(${item.productId}, this.value)">
              <button onclick="cartManager.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">₱${itemTotal}</div>
            <button class="remove-btn" onclick="cartManager.removeFromCart(${item.productId})">×</button>
          </div>
        `;
      }
    }

    container.innerHTML = itemsHTML;
    
    // Update total
    document.getElementById('cartTotal').textContent = `₱${totalPrice}`;
    
    // Setup checkout button
    document.getElementById('checkoutBtn').onclick = () => this.proceedToCheckout();
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    if (!api.isAuthenticated()) {
      alert('Please login to proceed');
      window.location.href = '/login.html';
      return;
    }

    // Get user's addresses
    const addresses = await api.getAddresses();
    
    if (addresses.addresses.length === 0) {
      alert('Please add a shipping address first');
      window.location.href = '/profile.html';
      return;
    }

    this.showCheckoutModal(addresses.addresses);
  }

  /**
   * Show checkout modal with address selection
   */
  showCheckoutModal(addresses) {
    const modal = document.getElementById('checkoutModal');
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
        
        <h2>Checkout</h2>
        
        <div class="checkout-section">
          <h3>Shipping Address</h3>
          <select id="addressSelect" class="form-control">
            ${addresses.map(addr => `
              <option value="${addr.id}">
                ${addr.label} - ${addr.address_line_1}, ${addr.city}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="checkout-section">
          <h3>Order Notes (Optional)</h3>
          <textarea id="orderNotes" class="form-control" placeholder="Special instructions..."></textarea>
        </div>
        
        <div class="checkout-summary">
          <p>Total Items: ${this.getItemCount()}</p>
          <p class="total">Total: ₱${this.getTotal()}</p>
        </div>
        
        <div class="checkout-actions">
          <button class="btn btn-primary" onclick="cartManager.completeCheckout()">
            Proceed to Payment
          </button>
          <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.style.display='none'">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  /**
   * Complete checkout and create order
   */
  async completeCheckout() {
    const addressId = parseInt(document.getElementById('addressSelect').value);
    const notes = document.getElementById('orderNotes').value;

    try {
      const response = await api.createOrder(
        this.cartItems,
        addressId,
        notes
      );

      if (response.success) {
        alert('Order created! Order ID: ' + response.order.id);
        this.clearCart();
        window.location.href = `/order-details.html?orderId=${response.order.id}`;
      } else {
        alert('Failed to create order: ' + response.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const cartModal = document.getElementById('cartModal');
    const cartBtn = document.querySelector('[data-page="cart"]');
    
    if (cartBtn) {
      cartBtn.addEventListener('click', async () => {
        await this.displayCart();
        cartModal.style.display = 'block';
      });
    }

    // Close modal on X
    const closeBtn = cartModal?.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
      });
    }
  }
}

// Create global cart manager
const cartManager = new CartManager();

// Update cart UI on page load
document.addEventListener('DOMContentLoaded', () => {
  cartManager.updateCartUI();
});
