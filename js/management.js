const STORAGE_KEYS = {
  sellers: 'debesmscat_sellers',
  products: 'debesmscat_products',
};

const defaultSellers = [
  {
    id: 1,
    fullName: 'Maria Santos',
    email: 'maria@debesmscat.edu.ph',
    phone: '09123456789',
    storeName: 'MRS Corner',
    category: 'Food & Snacks',
    location: 'Main Gate',
    description: 'Student snacks, bottled drinks, and breakfast meals.',
    status: 'Pending',
  },
  {
    id: 2,
    fullName: 'Ryan Dela Cruz',
    email: 'ryan@debesmscat.edu.ph',
    phone: '09987654321',
    storeName: 'RDC Stationery',
    category: 'Stationery',
    location: 'Student Center',
    description: 'School supplies, notebooks, and student essentials.',
    status: 'Approved',
  },
];

const defaultProducts = [
  {
    id: 1,
    productName: 'Chicken Rice Meal',
    price: 45,
    productCategory: 'Food & Snacks',
    stock: 20,
    productDescription: 'A classic campus meal with chicken, rice, and vegetables.',
  },
  {
    id: 2,
    productName: 'Notebook Set',
    price: 120,
    productCategory: 'Stationery',
    stock: 15,
    productDescription: 'Premium notebooks and writing materials for students.',
  },
];

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderPendingSellers() {
  const container = document.getElementById('pendingSellers');
  if (!container) return;

  const sellers = readStorage(STORAGE_KEYS.sellers, defaultSellers);
  const pending = sellers.filter((seller) => seller.status === 'Pending');

  if (!pending.length) {
    container.innerHTML = '<div class="empty-state">No pending seller requests.</div>';
    return;
  }

  container.innerHTML = pending
    .map(
      (seller) => `
        <div class="request-item">
          <div>
            <strong>${seller.storeName}</strong>
            <p>${seller.fullName} • ${seller.category}</p>
          </div>
          <button class="mini-btn approve-btn" data-id="${seller.id}">Approve</button>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('.approve-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const sellersList = readStorage(STORAGE_KEYS.sellers, defaultSellers);
      const targetId = Number(button.dataset.id);
      const updated = sellersList.map((seller) =>
        seller.id === targetId ? { ...seller, status: 'Approved' } : seller
      );
      writeStorage(STORAGE_KEYS.sellers, updated);
      renderPendingSellers();
      renderAdminQueue();
    });
  });
}

function renderAdminQueue() {
  const container = document.getElementById('adminQueue');
  if (!container) return;

  const sellers = readStorage(STORAGE_KEYS.sellers, defaultSellers);

  if (!sellers.length) {
    container.innerHTML = '<div class="empty-state">No seller requests available.</div>';
    return;
  }

  container.innerHTML = sellers
    .map(
      (seller) => `
        <div class="request-item admin-item">
          <div>
            <strong>${seller.storeName}</strong>
            <p>${seller.fullName} • ${seller.category}</p>
          </div>
          <span class="status-tag ${seller.status === 'Approved' ? 'approved' : 'pending'}">${seller.status}</span>
        </div>
      `
    )
    .join('');
}

function renderRecentProducts() {
  const container = document.getElementById('recentProducts');
  if (!container) return;

  const products = readStorage(STORAGE_KEYS.products, defaultProducts);

  if (!products.length) {
    container.innerHTML = '<div class="empty-state">No products published yet.</div>';
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="request-item">
          <div>
            <strong>${product.productName}</strong>
            <p>${product.productCategory} • ₱${product.price}</p>
          </div>
          <span class="status-tag approved">${product.stock} in stock</span>
        </div>
      `
    )
    .join('');
}

function handleSellerSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const seller = {
    id: Date.now(),
    fullName: data.get('fullName').toString().trim(),
    email: data.get('email').toString().trim(),
    phone: data.get('phone').toString().trim(),
    storeName: data.get('storeName').toString().trim(),
    category: data.get('category').toString().trim(),
    location: data.get('location').toString().trim(),
    description: data.get('description').toString().trim(),
    status: 'Pending',
  };

  const sellers = readStorage(STORAGE_KEYS.sellers, defaultSellers);
  sellers.unshift(seller);
  writeStorage(STORAGE_KEYS.sellers, sellers);

  form.reset();

  const message = document.getElementById('formMessage');
  if (message) {
    message.textContent = 'Seller request submitted successfully. It is now pending approval.';
  }

  renderPendingSellers();
  renderAdminQueue();
}

function handleProductSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const product = {
    id: Date.now(),
    productName: data.get('productName').toString().trim(),
    price: Number(data.get('price')),
    productCategory: data.get('productCategory').toString().trim(),
    stock: Number(data.get('stock')),
    productDescription: data.get('productDescription').toString().trim(),
  };

  const products = readStorage(STORAGE_KEYS.products, defaultProducts);
  products.unshift(product);
  writeStorage(STORAGE_KEYS.products, products);

  form.reset();

  const message = document.getElementById('productMessage');
  if (message) {
    message.textContent = 'Product published successfully and is now visible to buyers.';
  }

  renderRecentProducts();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPendingSellers();
  renderAdminQueue();
  renderRecentProducts();

  const registrationForm = document.getElementById('sellerRegistrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', handleSellerSubmit);
  }

  const productForm = document.getElementById('productUploadForm');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
});
