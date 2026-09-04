// ============================================
// Example: Products Module
// ============================================
// Shows how to load, display, and manage products

class ProductManager {
  /**
   * Load and display products
   */
  async loadProducts(page = 1, limit = 20) {
    try {
      const response = await api.getProducts(page, limit);
      
      if (response.success) {
        this.displayProducts(response.products);
        this.displayPagination(page, response.pagination);
        return response.products;
      } else {
        this.showError('Failed to load products');
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    if (!query.trim()) {
      this.loadProducts();
      return;
    }

    try {
      const response = await api.searchProducts(query);
      
      if (response.success) {
        this.displayProducts(response.products);
      } else {
        this.showError('No products found');
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Get products by category
   */
  async loadByCategory(category) {
    try {
      const response = await api.getProductsByCategory(category);
      
      if (response.success) {
        this.displayProducts(response.products);
      } else {
        this.showError('No products in this category');
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Display products in grid
   */
  displayProducts(products) {
    const container = document.getElementById('productsContainer');
    
    if (!products || products.length === 0) {
      container.innerHTML = '<p class="empty-message">No products found</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${this.getProductImage(product)}" alt="${product.product_name}">
          ${product.discount_percentage ? `
            <span class="discount-badge">-${product.discount_percentage}%</span>
          ` : ''}
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.product_name}</h3>
          <p class="product-category">${product.category}</p>
          
          <div class="product-rating">
            <span class="rating-stars">${this.renderStars(product.rating)}</span>
            <span class="rating-count">(${product.reviews_count})</span>
          </div>
          
          <div class="product-price">
            ${product.original_price && product.discount_percentage ? `
              <span class="original-price">₱${product.original_price}</span>
            ` : ''}
            <span class="current-price">₱${product.price}</span>
          </div>
          
          <p class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          
          <button class="btn btn-primary" onclick="productManager.viewProduct(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
            ${product.stock > 0 ? 'View Details' : 'Unavailable'}
          </button>
          <button class="btn btn-outline" onclick="productManager.addToWishlist(${product.id})">
            ♡ Wishlist
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * View product details
   */
  async viewProduct(productId) {
    try {
      const response = await api.getProduct(productId);
      
      if (response.success) {
        this.showProductModal(response.product);
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Display product details modal
   */
  showProductModal(product) {
    const modal = document.getElementById('productModal');
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
        
        <div class="modal-body">
          <div class="product-modal-image">
            <img src="${this.getProductImage(product)}" alt="${product.product_name}">
          </div>
          
          <div class="product-modal-info">
            <h2>${product.product_name}</h2>
            <p class="description">${product.description}</p>
            
            <div class="modal-price">
              <span class="price">₱${product.price}</span>
              <span class="stock">${product.stock} in stock</span>
            </div>
            
            <div class="quantity-selector">
              <label>Quantity:</label>
              <input type="number" id="quantity" min="1" max="${product.stock}" value="1">
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-primary btn-large" onclick="cartManager.addToCart(${product.id}, parseInt(document.getElementById('quantity').value))">
                Add to Cart
              </button>
              <button class="btn btn-secondary" onclick="productManager.addToWishlist(${product.id})">
                Add to Wishlist
              </button>
            </div>
            
            <div id="reviewsSection" class="reviews-section">
              <h3>Reviews</h3>
              <div id="reviewsList"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
    this.loadProductReviews(product.id);
  }

  /**
   * Load and display product reviews
   */
  async loadProductReviews(productId) {
    try {
      const response = await api.getProductReviews(productId);
      
      if (response.success && response.reviews.length > 0) {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = response.reviews.map(review => `
          <div class="review-item">
            <div class="review-header">
              <strong>${review.full_name}</strong>
              <span class="rating">${this.renderStars(review.rating)}</span>
            </div>
            <p class="review-comment">${review.comment}</p>
            <small class="review-date">${new Date(review.created_at).toLocaleDateString()}</small>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId) {
    if (!api.isAuthenticated()) {
      alert('Please login to add to wishlist');
      return;
    }
    
    // TODO: Implement wishlist API endpoint
    console.log('Added product', productId, 'to wishlist');
    alert('Added to wishlist!');
  }

  /**
   * Render star rating
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    let stars = '★'.repeat(fullStars);
    if (hasHalf) stars += '☆';
    stars += '☆'.repeat(5 - Math.ceil(rating));
    return stars;
  }

  /**
   * Get product image
   */
  getProductImage(product) {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/images/placeholder-product.jpg';
  }

  /**
   * Display pagination
   */
  displayPagination(currentPage, pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '<nav class="pagination">';
    
    if (currentPage > 1) {
      html += `<button onclick="productManager.loadProducts(${currentPage - 1})">← Previous</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
      html += `<button ${i === currentPage ? 'class="active"' : ''} onclick="productManager.loadProducts(${i})">${i}</button>`;
    }
    
    if (currentPage < totalPages) {
      html += `<button onclick="productManager.loadProducts(${currentPage + 1})">Next →</button>`;
    }
    
    html += '</nav>';
    paginationContainer.innerHTML = html;
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-alert';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Create global product manager
const productManager = new ProductManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  productManager.loadProducts();
  
  // Setup search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    productManager.searchProducts(e.target.value);
  });
});
