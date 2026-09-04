const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('[data-page]');
const categoryPills = document.querySelectorAll('.category-pill');
const searchInput = document.getElementById('searchInput');

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
  try {
    const browsePage = document.getElementById('page-browse');
    const shell = browsePage?.querySelector('.empty-shell');

    if (!shell) return;

    const heading = shell.querySelector('h3');
    const copy = shell.querySelector('p');

    if (heading) heading.textContent = 'Loading products...';
    if (copy) copy.textContent = 'Please wait...';

    let response;

    if (searchQuery && searchQuery.trim()) {
      response = await api.searchProducts(searchQuery.trim(), 1, 20);
    } else if (category && category !== 'All') {
      response = await api.getProductsByCategory(category, 1, 20);
    } else {
      response = await api.getProducts(1, 20);
    }

    if (!response.success || !response.products || response.products.length === 0) {
      if (searchQuery) {
        if (heading) heading.textContent = 'No matching listings found';
        if (copy) copy.textContent = `No results for "${searchQuery}" yet.`;
      } else {
        if (heading) heading.textContent = 'No listings published yet';
        if (copy) copy.textContent = 'Once campus sellers upload their products, they will appear in this catalog automatically.';
      }
      return;
    }

    // Display products
    const products = response.products;
    const catalogContainer = browsePage?.querySelector('[data-products]') || browsePage?.querySelector('.products-grid');
    
    if (catalogContainer) {
      catalogContainer.innerHTML = products
        .map(
          (product) => `
        <div class="product-card">
          <div class="product-image">
            ${product.image_url ? `<img src="${product.image_url}" alt="${product.product_name}">` : '<div class="placeholder">No Image</div>'}
          </div>
          <div class="product-info">
            <h4>${product.product_name}</h4>
            <p class="product-category">${product.category}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
              <span class="price">₱${product.price.toFixed(2)}</span>
              <span class="stock">${product.stock} available</span>
            </div>
            <button class="btn-add-cart" onclick="addToCartFromAPI(${product.id}, '${product.product_name}', ${product.price})">Add to Cart</button>
          </div>
        </div>
      `
        )
        .join('');

      // Hide empty shell
      if (shell) shell.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading products:', error);
    const browsePage = document.getElementById('page-browse');
    const shell = browsePage?.querySelector('.empty-shell');
    if (shell) {
      shell.querySelector('h3').textContent = 'Error loading products';
      shell.querySelector('p').textContent = 'Please try again later.';
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
  await loadProductsFromAPI('All', '');
});