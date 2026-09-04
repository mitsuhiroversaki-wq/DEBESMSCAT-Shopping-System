async function renderPendingSellers() {
  const container = document.getElementById('pendingSellers');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading sellers...</p>';
  const response = await api.adminGetPendingSellers(1, 20);

  if (!response.success) {
    container.innerHTML = '<div class="empty-state">Sign in as an admin to view pending sellers.</div>';
    return;
  }

  const sellers = response.sellers || [];
  container.innerHTML = sellers.length
    ? sellers.map((seller) => `
        <div class="request-item">
          <div>
            <strong>${seller.store_name}</strong>
            <p>${seller.full_name} • ${seller.category}</p>
            <p>${seller.email}</p>
          </div>
          <button class="mini-btn approve-btn" data-id="${seller.id}">Approve</button>
        </div>
      `).join('')
    : '<div class="empty-state">No pending seller requests.</div>';

  container.querySelectorAll('.approve-btn').forEach((button) => {
    button.addEventListener('click', () => approveSeller(button.dataset.id, button));
  });
}

async function renderAdminQueue() {
  const container = document.getElementById('adminQueue');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading queue...</p>';
  const response = await api.adminGetAllSellers(1, 20);

  if (!response.success) {
    container.innerHTML = '<div class="empty-state">Sign in as an admin to view the queue.</div>';
    return;
  }

  const sellers = response.sellers || [];
  container.innerHTML = sellers.length
    ? sellers.map((seller) => `
        <div class="request-item">
          <div><strong>${seller.store_name}</strong><p>${seller.email}</p></div>
          <span class="status-tag ${seller.status.toLowerCase()}">${seller.status}</span>
        </div>
      `).join('')
    : '<div class="empty-state">No seller requests available.</div>';
}

async function approveSeller(sellerId, button) {
  button.disabled = true;
  button.textContent = 'Approving...';
  const response = await api.adminApproveSeller(sellerId);

  if (!response.success) {
    button.disabled = false;
    button.textContent = 'Approve';
    alert(response.message);
    return;
  }

  await Promise.all([renderPendingSellers(), renderAdminQueue()]);
}

async function handleSellerSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const message = document.getElementById('formMessage');

  submitButton.disabled = true;
  const response = await api.registerSeller(
    data.get('fullName').toString().trim(),
    data.get('email').toString().trim(),
    data.get('password').toString(),
    data.get('phone').toString().trim(),
    data.get('storeName').toString().trim(),
    data.get('category').toString().trim(),
    data.get('location').toString().trim(),
    data.get('description').toString().trim()
  );

  submitButton.disabled = false;
  message.textContent = response.success
    ? 'Seller request submitted successfully. It is now pending approval.'
    : response.message;
  message.classList.toggle('success', response.success);
  message.classList.toggle('error', !response.success);
  if (response.success) form.reset();
}

async function renderRecentProducts() {
  const container = document.getElementById('recentProducts');
  if (!container) return;

  const response = await api.getProducts(1, 10);
  if (!response.success) {
    container.innerHTML = '<div class="empty-state">Unable to load products.</div>';
    return;
  }

  const products = response.products || [];
  container.innerHTML = products.length
    ? products.map((product) => `
        <div class="request-item">
          <div><strong>${product.product_name}</strong><p>${product.category}</p></div>
          <span class="status-tag approved">${product.stock} in stock</span>
        </div>
      `).join('')
    : '<div class="empty-state">No products published yet.</div>';
}

async function handleProductSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const message = document.getElementById('productMessage');
  const response = await api.createProduct(
    data.get('productName').toString().trim(),
    Number(data.get('price')),
    Number(data.get('stock')),
    data.get('productCategory').toString().trim(),
    data.get('productDescription').toString().trim()
  );

  message.textContent = response.success ? 'Product published successfully.' : response.message;
  message.classList.toggle('success', response.success);
  message.classList.toggle('error', !response.success);
  if (response.success) {
    form.reset();
    await renderRecentProducts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const registrationForm = document.getElementById('sellerRegistrationForm');
  if (registrationForm) registrationForm.addEventListener('submit', handleSellerSubmit);
  const productForm = document.getElementById('productUploadForm');
  if (productForm) productForm.addEventListener('submit', handleProductSubmit);
  renderPendingSellers().catch(console.error);
  renderAdminQueue().catch(console.error);
  renderRecentProducts().catch(console.error);
});
