// ============================================
// Example: Authentication Module
// ============================================
// Shows how to integrate authentication with the API

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Handle user registration
   */
  async register(fullName, email, password, phone = '') {
    try {
      const response = await api.register(fullName, email, password, 'customer');
      
      if (response.success) {
        this.currentUser = response.user;
        this.isAuthenticated = true;
        
        // Trigger auth change event
        this.dispatchAuthChangeEvent();
        
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle user login
   */
  async login(email, password) {
    try {
      const response = await api.login(email, password);
      
      if (response.success) {
        this.currentUser = response.user;
        this.isAuthenticated = true;
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Trigger auth change event
        this.dispatchAuthChangeEvent();
        
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle user logout
   */
  async logout() {
    try {
      await api.logout();
      
      this.currentUser = null;
      this.isAuthenticated = false;
      
      // Clear user info
      localStorage.removeItem('user');
      
      // Trigger auth change event
      this.dispatchAuthChangeEvent();
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if user is authenticated
   */
  checkAuthentication() {
    return api.isAuthenticated();
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser || JSON.parse(localStorage.getItem('user') || 'null');
  }

  /**
   * Dispatch custom event when auth changes
   */
  dispatchAuthChangeEvent() {
    const event = new CustomEvent('authChange', {
      detail: {
        isAuthenticated: this.isAuthenticated,
        user: this.currentUser,
      },
    });
    document.dispatchEvent(event);
  }

  /**
   * Listen for auth changes
   */
  onAuthChange(callback) {
    document.addEventListener('authChange', callback);
  }
}

// Create global auth manager
const authManager = new AuthManager();

// Usage in HTML:
/*
<form id="loginForm">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Login</button>
  <div id="loginError" class="error-message"></div>
</form>

<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await authManager.login(email, password);
    
    if (result.success) {
      console.log('Login successful:', result.user);
      window.location.href = '/dashboard.html';
    } else {
      document.getElementById('loginError').textContent = result.message;
    }
  });
  
  // Listen for auth changes
  authManager.onAuthChange((event) => {
    console.log('Auth changed:', event.detail);
    updateUIBasedOnAuth(event.detail.isAuthenticated);
  });
</script>
*/
