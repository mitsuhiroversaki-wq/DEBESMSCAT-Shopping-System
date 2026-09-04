# DEBESMSCAT Campus Shopping System

> A full-stack college marketplace platform inspired by Shoppee and Lazada, built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

![Status](https://img.shields.io/badge/status-development-yellow)
![License](https://img.shields.io/badge/license-ISC-blue)
![Node Version](https://img.shields.io/badge/node-16%2B-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Frontend Integration](#frontend-integration)
- [Deployment](#deployment)
- [Development](#development)
- [Thesis Information](#thesis-information)
- [Contributing](#contributing)

---

## 🎯 Overview

DEBESMSCAT Campus Shopping System is a modern marketplace platform designed for college communities. It enables students and faculty to:

- **Customers**: Browse and purchase campus products
- **Sellers**: Register stores and sell products on the campus marketplace
- **Admins**: Manage sellers, products, and monitor platform activity

The system is designed to handle **large-scale user bases** with proper database optimization, API architecture, and security features suitable for a production-level application.

---

## ✨ Features

### Customer Features
- ✅ User registration and authentication
- ✅ Browse and search products
- ✅ Product filtering by category and price range
- ✅ Shopping cart management
- ✅ Order placement and tracking
- ✅ Order history and details
- ✅ Product reviews and ratings
- ✅ Wishlist functionality
- ✅ Multiple shipping addresses
- ✅ User profile management

### Seller Features
- ✅ Seller registration and approval workflow
- ✅ Store profile management
- ✅ Product catalog management (CRUD)
- ✅ Order management dashboard
- ✅ Sales analytics and performance metrics
- ✅ Seller ratings and reviews
- ✅ Store customization options

### Admin Features
- ✅ Seller approval/rejection workflow
- ✅ User and seller management
- ✅ Product moderation
- ✅ Platform analytics dashboard
- ✅ Sales reports and trends
- ✅ System status monitoring
- ✅ Audit logs

---

## 🏗️ Project Structure

```
DEBESMSCAT-Shopping-System/
│
├── Shopping-System/              # Frontend Application
│   ├── index.html                # Home page
│   ├── admin.html                # Admin dashboard
│   ├── seller-dashboard.html     # Seller dashboard
│   ├── seller-registration.html  # Seller registration
│   ├── css/
│   │   └── styles.css            # Global styles
│   ├── js/
│   │   ├── api.js                # ⭐ API Client Service
│   │   ├── script.js             # Main app logic
│   │   ├── management.js         # Page management
│   │   └── examples/             # Implementation examples
│   │       ├── authExample.js
│   │       ├── productsExample.js
│   │       ├── cartExample.js
│   │       └── adminExample.js
│   ├── files/
│   │   └── images/               # Product images
│   ├── API_INTEGRATION_GUIDE.md  # 📚 Integration documentation
│   └── README.md
│
├── backend/                      # Backend Application
│   ├── server.js                 # Entry point
│   ├── config/                   # Configuration
│   │   ├── database.js           # PostgreSQL connection
│   │   └── environment.js        # Environment config
│   ├── routes/                   # API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── sellers.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── sellerController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js       # Error handling
│   ├── migrations/               # Database migrations
│   │   └── 001_create_initial_schema.sql
│   ├── scripts/                  # Setup scripts
│   │   ├── migrate.js            # Run migrations
│   │   └── seed.js               # Populate test data
│   ├── package.json              # Dependencies
│   ├── .env.example              # Environment template
│   ├── README.md                 # Backend documentation
│   └── .gitignore
│
└── README.md                     # This file
```

---

## 💻 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **pg-promise** - Database driver

### Tools & Services
- **Git** - Version control
- **npm** - Package manager
- **Postman** - API testing
- **Docker** - Containerization (optional)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn**
- **Git**

### 1. Clone/Setup Project

```bash
# Navigate to project directory
cd DEBESMSCAT-Shopping-System
```

### 2. Setup Backend

```bash
# Enter backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your PostgreSQL credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=debesmscat_shopping
# DB_USER=postgres
# DB_PASSWORD=your_password

# Run database migrations
npm run migrate

# Optional: Seed test data
npm run seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Setup Frontend

```bash
# In a new terminal, enter Shopping-System directory
cd Shopping-System

# For development, you can use a simple HTTP server:
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server

# Or using VS Code Live Server extension
```

Frontend runs on: `http://localhost:8000` or configured port

### 4. Test the Application

**API Health Check:**
```bash
curl http://localhost:5000/api/v1/health
```

**Login with Default Admin:**
```
Email: admin@debesmscat.edu.ph
Password: admin123
```

**Sample Users (after seeding):**
```
Customer: john@debesmscat.edu.ph / password123
Seller 1: maria@debesmscat.edu.ph / password123
Seller 2: ryan@debesmscat.edu.ph / password123
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Quick Reference

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh-token` - Refresh JWT token

#### Products
- `GET /products` - Get all products
- `GET /products/search` - Search products
- `GET /products/:id` - Get product details
- `GET /products/category/:category` - Get by category
- `POST /products` - Create product (seller only)
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Orders
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id/cancel` - Cancel order

#### Sellers
- `GET /sellers` - Get all sellers
- `GET /sellers/:id` - Get seller details
- `POST /sellers/register` - Register as seller
- `GET /sellers/:id/products` - Get seller's products

#### Admin
- `GET /admin/sellers/pending` - Get pending sellers
- `PUT /admin/sellers/:id/approve` - Approve seller
- `PUT /admin/sellers/:id/reject` - Reject seller
- `GET /admin/analytics/dashboard` - Dashboard stats

For complete API reference, see [backend/README.md](backend/README.md)

---

## 🔌 Frontend Integration

### Quick Start

1. **Include the API Client** in your HTML:
```html
<script src="js/api.js"></script>
```

2. **Use API methods** in your JavaScript:
```javascript
// Login
const response = await api.login('email@example.com', 'password');

// Get products
const products = await api.getProducts();

// Create order
const order = await api.createOrder(cartItems, addressId);
```

3. **Check authentication**:
```javascript
if (api.isAuthenticated()) {
  // User is logged in
}
```

### Integration Examples

See the `js/examples/` folder for complete implementations:
- `authExample.js` - Authentication flow
- `productsExample.js` - Product browsing and search
- `cartExample.js` - Shopping cart management
- `adminExample.js` - Admin functions

For detailed guide, see [Shopping-System/API_INTEGRATION_GUIDE.md](Shopping-System/API_INTEGRATION_GUIDE.md)

---

## 🔐 Security Features

- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **CORS Protection** - Cross-origin controls
- ✅ **Input Validation** - Server-side validation
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **Security Headers** - Helmet.js
- ✅ **Error Handling** - No sensitive data in errors

---

## 📊 Database Schema

The system includes 17 core tables:

- **users** - User accounts and roles
- **sellers** - Seller store profiles
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **reviews** - Product reviews and ratings
- **shopping_carts** - Shopping cart sessions
- **user_addresses** - Shipping/billing addresses
- **payments** - Payment transactions
- **seller_transactions** - Seller earnings
- **notifications** - User notifications
- **promotions** - Coupons and discounts
- **reports** - User reports/complaints
- **order_tracking** - Order status updates
- **wishlist** - Bookmarked products
- **admin_logs** - Admin activity audit
- **cart_items** - Shopping cart items

---

## 🧪 Testing

### Test API Endpoints (Postman)

1. Register user: `POST /auth/register`
2. Login: `POST /auth/login`
3. Get products: `GET /products`
4. Create order: `POST /orders`

### Sample Test Data

After running `npm run seed` in the backend, you can test with:

```javascript
// In browser console:
await api.login('maria@debesmscat.edu.ph', 'password123');
const products = await api.getProducts();
console.log(products);
```

---

## 📈 Performance Optimization

The system is optimized for large scale:

- ✅ Database indexing on frequently queried columns
- ✅ Pagination for large datasets
- ✅ Connection pooling for database
- ✅ Caching strategies (localStorage, memory)
- ✅ Async/await for non-blocking operations
- ✅ Efficient query design

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure CDN for static files
- [ ] Enable rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email service
- [ ] Set up payment gateway

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku create debesmscat-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku config:set JWT_SECRET=your_secret_key
```

### Deploy publicly with Render

The repository includes `render.yaml`, which configures one web service and a PostgreSQL database. To publish the application:

1. Push this project to a GitHub repository.
2. In Render, choose **New > Blueprint** and connect that repository.
3. Select the repository root containing `render.yaml` and apply the blueprint.
4. Wait for the migration and deployment to finish, then share the generated `onrender.com` URL.

The deployed URL serves the frontend and API from the same origin. Do not commit a `.env` file; Render generates `JWT_SECRET` and supplies the database connection variables from the managed database.

### Deploy to AWS

See deployment guide in [backend/README.md](backend/README.md)

---

## 🛠️ Development

### Run Backend in Development Mode

```bash
cd backend
npm run dev          # With hot-reload (nodemon)
```

### Run Frontend with Live Reload

```bash
# Using Python
cd Shopping-System
python -m http.server 8000

# Or VS Code Live Server
# Right-click index.html → Open with Live Server
```

### Debug API Calls

```javascript
// In browser console:
// Add logging to all API calls
const originalRequest = api.request.bind(api);
api.request = async function(...args) {
  console.log('📤 API:', args);
  const result = await originalRequest(...args);
  console.log('📥 Response:', result);
  return result;
};
```

---

## 📝 Thesis Information

This project demonstrates:

### Full-Stack Architecture
- Clear separation of concerns (frontend/backend)
- RESTful API design
- Proper database schema with relationships
- Authentication and authorization patterns

### Scalability
- Connection pooling for database
- Pagination and filtering for large datasets
- Indexed queries for performance
- Stateless API design

### Security
- Password hashing with bcryptjs
- JWT token authentication
- SQL injection prevention
- CORS and security headers
- Input validation and sanitization

### Software Engineering Best Practices
- Modular code structure
- Error handling and logging
- API documentation
- Database migrations
- Version control with Git
- Code reusability

### Real-World Problem Solving
- Multi-role user system (customer, seller, admin)
- Order management workflow
- Seller verification process
- Payment integration points
- Notification system

---

## 📞 Support & Issues

For questions or issues:
1. Check documentation in each folder
2. Review examples in `js/examples/`
3. Check backend API docs in `backend/README.md`
4. Review frontend integration guide

---

## 📄 License

ISC License © DEBESMSCAT Shopping System

---

## 👨‍💼 Author

**Development Team**: DEBESMSCAT  
**Project**: Campus Shopping Marketplace  
**Status**: Development/Thesis  
**Last Updated**: 2026-08-31

---

## 🙏 Acknowledgments

Built as a comprehensive thesis project demonstrating:
- Full-stack web development
- Database design and optimization
- API development and integration
- Frontend-backend communication
- Software architecture patterns

---

## 📚 Additional Resources

- [Backend API Documentation](backend/README.md)
- [Frontend Integration Guide](Shopping-System/API_INTEGRATION_GUIDE.md)
- [Database Schema](backend/migrations/001_create_initial_schema.sql)
- [Example Implementations](Shopping-System/js/examples/)

---

## Quick Command Reference

```bash
# Backend Setup
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev

# Frontend Development
cd Shopping-System
python -m http.server 8000

# Test Login
Email: admin@debesmscat.edu.ph
Password: admin123

# API Health
curl http://localhost:5000/api/v1/health
```

---

**Happy Coding! 🎉**
