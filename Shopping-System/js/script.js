const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('[data-page]');
const categoryPills = document.querySelectorAll('.category-pill');
const searchInput = document.getElementById('searchInput');
const productCache = new Map();
let latestProductRequest = 0;

function getProductCacheKey(category, searchQuery) {
  return `${category}|${searchQuery.trim().toLowerCase()}`;
}

function updateEmptyState(shell, headingText, copyText) {
  if (!shell) return;
  shell.style.display = '';
  shell.querySelector('h3').textContent = headingText;
  shell.querySelector('p').textContent = copyText;
}

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(cart) ? cart.filter((item) => item.id && item.quantity > 0) : [];
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function updateCartBadges(cart = readCart()) {
  const itemCount = cart.reduce((total, item) => total + Number(item.quantity), 0);
  document.querySelectorAll('.cart').forEach((counter) => {
    counter.textContent = itemCount;
  });
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const emptyState = document.getElementById('cartEmpty');
  const totalElement = document.getElementById('cartTotal');
  if (!container || !emptyState || !totalElement) return;

  const cart = readCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  totalElement.textContent = `₱${total.toFixed(2)}`;
  updateCartBadges(cart);
  emptyState.style.display = cart.length ? 'none' : '';

  container.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <div>
        <h3>${escapeHtml(item.product_name)}</h3>
        <p>₱${Number(item.price).toFixed(2)} each</p>
      </div>
      <div class="cart-item-actions">
        <button type="button" class="quantity-button" data-cart-action="decrease" data-cart-id="${item.id}" aria-label="Decrease quantity">-</button>
        <span>${item.quantity}</span>
        <button type="button" class="quantity-button" data-cart-action="increase" data-cart-id="${item.id}" aria-label="Increase quantity">+</button>
        <button type="button" class="remove-cart-button" data-cart-action="remove" data-cart-id="${item.id}">Remove</button>
      </div>
    </article>
  `).join('');
}

function updateCartItem(productId, action) {
  const cart = readCart();
  const item = cart.find((entry) => String(entry.id) === String(productId));
  if (!item) return;

  if (action === 'remove') item.quantity = 0;
  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;

  const nextCart = cart.filter((entry) => entry.quantity > 0);
  localStorage.setItem('cart', JSON.stringify(nextCart));
  renderCart();
}

function showPage(targetPage) {
  pages.forEach((page) => {
    const isActive = page.id === `page-${targetPage}`;
    page.classList.toggle('active', isActive);
  });

  navButtons.forEach((button) => {
    const pageName = button.dataset.page;
    const isActive = pageName === targetPage;
    button.classList.toggle('active', isActive);
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.page;
    if (target) {
      showPage(target);
    }
  });
});

categoryPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    categoryPills.forEach((item) => item.classList.remove('active'));
    pill.classList.add('active');
  });
});

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    const browsePage = document.getElementById('page-browse');
    const shell = browsePage?.querySelector('.empty-shell');

    if (!shell) return;

    const heading = shell.querySelector('h3');
    const copy = shell.querySelector('p');

    if (!value) {
      heading.textContent = 'No listings published yet';
      copy.textContent = 'Once campus sellers upload their products, they will appear in this catalog automatically.';
      return;
    }

    heading.textContent = 'No matching listings found';
    copy.textContent = `No results for “${value}” yet. Sellers will publish matching items as soon as the catalog is active.`;
  });
}
/**
 * Load products from API with search and filter support
 */
async function loadProductsFromAPI(category = 'All', searchQuery = '') {
  const requestId = ++latestProductRequest;
  try {
    const browsePage = document.getElementById('page-browse');
    const shell = browsePage?.querySelector('.empty-shell');

    if (!shell) return;

    const heading = shell.querySelector('h3');
    const copy = shell.querySelector('p');

    if (heading) heading.textContent = 'Loading products...';
    if (copy) copy.textContent = 'Please wait...';

    const cacheKey = getProductCacheKey(category, searchQuery);
    const cachedResponse = productCache.get(cacheKey);
    const response = cachedResponse || await (async () => {
      let result;

      if (searchQuery && searchQuery.trim()) {
        const activeCategory = category !== 'All' ? category : null;
        result = await api.searchProducts(searchQuery.trim(), activeCategory, null, null, 1, 20);
      } else if (category && category !== 'All') {
        result = await api.getProductsByCategory(category, 1, 20);
      } else {
        result = await api.getProducts(1, 20);
      }

      productCache.set(cacheKey, result);
      return result;
    })();

    if (requestId !== latestProductRequest) return;

    const products = response.products || [];
    const catalogContainer = browsePage?.querySelector('[data-products]');

    if (!response.success || products.length === 0) {
      if (catalogContainer) catalogContainer.innerHTML = '';
      if (searchQuery) {
        updateEmptyState(shell, 'No matching listings found', `No results for "${searchQuery}" yet.`);
      } else {
        updateEmptyState(shell, 'No listings published yet', 'Once campus sellers upload their products, they will appear in this catalog automatically.');
      }
      return;
    }

    // Display products
    if (catalogContainer) {
      catalogContainer.innerHTML = products
        .map(
          (product) => `
        <div class="product-card">
          <div class="product-image">
            ${product.image_url ? `<img src="${product.image_url}" alt="${product.product_name}" loading="lazy" decoding="async">` : '<div class="placeholder">No Image</div>'}
          </div>
          <div class="product-info">
            <h4>${product.product_name}</h4>
            <p class="product-category">${product.category}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
              <span class="price">₱${Number(product.price).toFixed(2)}</span>
              <span class="stock">${product.stock} available</span>
            </div>
            <button class="btn-add-cart" onclick="addToCartFromAPI(${product.id}, ${JSON.stringify(product.product_name)}, ${Number(product.price)})">Add to Cart</button>
          </div>
        </div>
      `
        )
        .join('');

      // Hide empty shell
      if (shell) shell.style.display = 'none';
    }
  } catch (error) {
    if (requestId !== latestProductRequest) return;
    console.error('Error loading products:', error);
    const browsePage = document.getElementById('page-browse');
    const shell = browsePage?.querySelector('.empty-shell');
    if (shell) {
      updateEmptyState(shell, 'Unable to load listings', 'Check your connection and try again.');
    }
  }
}

/**
 * Add product to cart via API integration
 */
async function addToCartFromAPI(productId, productName, price) {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        product_name: productName,
        price: price,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    alert(`${productName} added to cart!`);
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add to cart');
  }
}

// Update category pills to use API
categoryPills.forEach((pill) => {
  pill.addEventListener('click', async () => {
    categoryPills.forEach((item) => item.classList.remove('active'));
    pill.classList.add('active');
    
    const category = pill.textContent.trim();
    const searchValue = searchInput?.value.trim() || '';
    await loadProductsFromAPI(category, searchValue);
  });
});

// Update search to use API with debounce
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    const value = event.target.value.trim();
    
    searchTimeout = setTimeout(async () => {
      const activeCategory = document.querySelector('.category-pill.active')?.textContent.trim() || 'All';
      await loadProductsFromAPI(activeCategory, value);
    }, 300);
  });
}

// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
  renderCart();
  document.getElementById('cartItems')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (button) updateCartItem(button.dataset.cartId, button.dataset.cartAction);
  });

  document.getElementById('checkoutForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const cart = readCart();
    const message = document.getElementById('checkoutMessage');
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    const formData = new FormData(event.currentTarget);
    const paymentMethod = formData.get('paymentMethod');

    if (!cart.length) {
      message.textContent = 'Add an item before placing your order.';
      return;
    }

    submitButton.disabled = true;
    message.textContent = 'Creating your order...';
    const response = await api.createOrder(
      cart.map((item) => ({ productId: item.id, quantity: Number(item.quantity) })),
      Number(formData.get('shippingAddressId')),
      formData.get('orderNotes').toString().trim(),
      paymentMethod
    );
    submitButton.disabled = false;

    if (!response.success) {
      message.textContent = response.message || 'Unable to place the order.';
      return;
    }

    localStorage.removeItem('cart');
    renderCart();
    message.textContent = paymentMethod === 'cod'
      ? `Order ${response.order.order_number} placed. Pay cash when it arrives.`
      : `Order ${response.order.order_number} created. Payment is awaiting provider confirmation.`;
  });

  await loadProductsFromAPI('All', '');
});