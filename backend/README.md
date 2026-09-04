# DEBESMSCAT Shopping System - Backend API

A modern Node.js + Express backend API for the DEBESMSCAT Campus Shopping System, a Shoppee/Lazada-style marketplace for college communities.

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet.js, bcryptjs for password hashing
- **API Documentation**: RESTful

## 📋 Project Structure

```
backend/
├── config/              # Configuration files
│   ├── database.js     # PostgreSQL connection
│   └── environment.js  # Environment variables
├── routes/             # API route definitions
│   ├── auth.js        # Authentication endpoints
│   ├── users.js       # User profile endpoints
│   ├── sellers.js     # Seller management
│   ├── products.js    # Product management
│   ├── orders.js      # Order management
│   └── admin.js       # Admin panel endpoints
├── controllers/        # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── sellerController.js
│   ├── productController.js
│   ├── orderController.js
│   └── adminController.js
├── middleware/         # Custom middleware
│   ├── auth.js        # JWT verification
│   └── errorHandler.js # Global error handling
├── migrations/         # Database schemas (next step)
├── .env.example       # Environment template
├── server.js          # Entry point
└── package.json       # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone/Setup**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Server will start at: `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/change-password` - Change password

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/addresses` - Get user addresses
- `POST /api/v1/users/addresses` - Add address
- `GET /api/v1/users/orders` - Get user orders

### Sellers
- `GET /api/v1/sellers` - Get all approved sellers
- `GET /api/v1/sellers/:id` - Get seller details
- `POST /api/v1/sellers/register` - Register as seller
- `GET /api/v1/sellers/:id/products` - Get seller's products
- `GET /api/v1/sellers/:id/dashboard` - Seller dashboard

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (seller only)
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/:id/reviews` - Get product reviews
- `POST /api/v1/products/:id/reviews` - Add review

### Orders
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id/cancel` - Cancel order
- `GET /api/v1/orders/:id/tracking` - Get tracking info
- `POST /api/v1/orders/checkout` - Checkout process
- `POST /api/v1/orders/payment-confirm` - Confirm payment

### Admin
- `GET /api/v1/admin/sellers` - Get all sellers
- `GET /api/v1/admin/sellers/pending` - Get pending sellers
- `PUT /api/v1/admin/sellers/:id/approve` - Approve seller
- `PUT /api/v1/admin/sellers/:id/reject` - Reject seller
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/analytics/dashboard` - Dashboard stats
- `GET /api/v1/admin/analytics/sales` - Sales analytics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in → receives JWT token
2. Include token in Authorization header: `Authorization: Bearer <token>`
3. Token expires after 7 days (configurable)

Example:
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/v1/users/profile
```

## 🗄️ Database Setup (Next Steps)

Run migrations to create database schema:
```bash
npm run migrate
npm run seed  # Optional: populate sample data
```

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=debesmscat_shopping
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Input validation with validator.js
- ✅ CORS enabled
- ✅ Helmet.js security headers
- ✅ SQL injection protection (parameterized queries)

## 📊 Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies

- **express** - Web framework
- **pg-promise** - PostgreSQL connection
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin support
- **helmet** - Security headers
- **validator** - Input validation
- **morgan** - Request logging

## 🚀 Deployment

### Production Checklist
1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use strong JWT secret
4. Enable HTTPS
5. Set up database backups
6. Configure CDN for static files
7. Enable rate limiting
8. Set up error monitoring (Sentry)

### Deploy on Heroku
```bash
heroku create debesmscat-backend
git push heroku main
heroku config:set DATABASE_URL=...
```

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.

## 📄 License

ISC License - DEBESMSCAT Shopping System
