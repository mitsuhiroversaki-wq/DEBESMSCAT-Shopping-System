// ============================================
// Example: Admin Dashboard Module
// ============================================
// Shows how to manage admin functions

class AdminManager {
  constructor() {
    this.setupEventListeners();
    this.checkAdminAccess();
  }

  /**
   * Check if user has admin access
   */
  async checkAdminAccess() {
    const profile = await api.getProfile();
    
    if (!profile.user || profile.user.role !== 'admin') {
      alert('Admin access required');
      window.location.href = '/index.html';
    }
  }

  /**
   * Load dashboard analytics
   */
  async loadDashboard() {
    try {
      const analytics = await api.adminGetDashboardAnalytics();
      
      if (analytics.success) {
        this.displayDashboardStats(analytics.stats);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  /**
   * Display dashboard statistics
   */
  displayDashboardStats(stats) {
    document.getElementById('totalUsers').textContent = stats.total_users;
    document.getElementById('totalSellers').textContent = stats.total_sellers;
    document.getElementById('totalProducts').textContent = stats.total_products;
    document.getElementById('totalOrders').textContent = stats.total_orders;
    document.getElementById('totalRevenue').textContent = `₱${stats.total_revenue}`;
  }

  /**
   * Load and display pending sellers
   */
  async loadPendingSellers() {
    try {
      const response = await api.adminGetPendingSellers(1, 20);
      
      if (response.success) {
        this.displayPendingSellers(response.sellers);
      }
    } catch (error) {
      console.error('Failed to load sellers:', error);
    }
  }

  /**
   * Display pending sellers list
   */
  displayPendingSellers(sellers) {
    const container = document.getElementById('pendingSellersList');
    
    if (!sellers || sellers.length === 0) {
      container.innerHTML = '<p class="empty-message">No pending seller requests</p>';
      return;
    }

    container.innerHTML = sellers.map(seller => `
      <div class="seller-request-card">
        <div class="seller-info">
          <h4>${seller.store_name}</h4>
          <p><strong>Owner:</strong> ${seller.full_name}</p>
          <p><strong>Email:</strong> ${seller.email}</p>
          <p><strong>Phone:</strong> ${seller.phone}</p>
          <p><strong>Category:</strong> ${seller.category}</p>
          <p><strong>Description:</strong> ${seller.description || 'N/A'}</p>
        </div>
        <div class="seller-actions">
          <button class="btn btn-success" onclick="adminManager.approveSeller(${seller.id})">
            ✓ Approve
          </button>
          <button class="btn btn-danger" onclick="adminManager.rejectSellerModal(${seller.id})">
            ✗ Reject
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Approve seller
   */
  async approveSeller(sellerId) {
    if (confirm('Approve this seller?')) {
      const response = await api.adminApproveSeller(sellerId);
      
      if (response.success) {
        alert('Seller approved!');
        this.loadPendingSellers();
      } else {
        alert('Failed to approve seller');
      }
    }
  }

  /**
   * Show reject modal
   */
  rejectSellerModal(sellerId) {
    const reason = prompt('Enter rejection reason:');
    
    if (reason) {
      this.rejectSeller(sellerId, reason);
    }
  }

  /**
   * Reject seller
   */
  async rejectSeller(sellerId, reason) {
    const response = await api.adminRejectSeller(sellerId, reason);
    
    if (response.success) {
      alert('Seller rejected!');
      this.loadPendingSellers();
    } else {
      alert('Failed to reject seller');
    }
  }

  /**
   * Load all users
   */
  async loadAllUsers() {
    try {
      const response = await api.adminGetAllUsers(1, 50);
      
      if (response.success) {
        this.displayUsersList(response.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  /**
   * Display users list
   */
  displayUsersList(users) {
    const container = document.getElementById('usersList');
    
    container.innerHTML = `
      <table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.full_name}</td>
              <td>${user.email}</td>
              <td>${user.phone || 'N/A'}</td>
              <td><span class="badge badge-${user.role}">${user.role}</span></td>
              <td>
                <button class="btn btn-sm btn-danger" onclick="adminManager.deleteUser(${user.id})">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
      const response = await api.adminDeleteUser(userId);
      
      if (response.success) {
        alert('User deleted!');
        this.loadAllUsers();
      }
    }
  }

  /**
   * Load sales analytics
   */
  async loadSalesAnalytics() {
    try {
      const response = await api.adminGetSalesAnalytics('month');
      
      if (response.success) {
        this.displaySalesChart(response.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  /**
   * Display sales chart (requires Chart.js)
   */
  displaySalesChart(analytics) {
    const labels = analytics.map(item => 
      new Date(item.period).toLocaleDateString()
    );
    const data = analytics.map(item => item.revenue);

    // Assuming Chart.js is included
    if (typeof Chart !== 'undefined') {
      const ctx = document.getElementById('salesChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Sales Revenue',
            data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Sales Revenue',
            },
          },
        },
      });
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('[data-admin-tab]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.adminTab;
        this.switchTab(tabName);
      });
    });
  }

  /**
   * Switch admin tab
   */
  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('[data-admin-content]').forEach(content => {
      content.style.display = 'none';
    });

    // Show selected tab
    const selectedTab = document.querySelector(`[data-admin-content="${tabName}"]`);
    if (selectedTab) {
      selectedTab.style.display = 'block';

      // Load data based on tab
      switch (tabName) {
        case 'dashboard':
          this.loadDashboard();
          break;
        case 'sellers':
          this.loadPendingSellers();
          break;
        case 'users':
          this.loadAllUsers();
          break;
        case 'analytics':
          this.loadSalesAnalytics();
          break;
      }
    }
  }
}

// Create global admin manager
const adminManager = new AdminManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  adminManager.loadDashboard();
});
