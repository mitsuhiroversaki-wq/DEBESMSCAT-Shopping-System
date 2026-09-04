require('dotenv').config();

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  API_URL: process.env.API_URL || 'http://localhost:5000',

  // Database
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'debesmscat_shopping',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  },

  // JWT
  JWT: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
  },

  // CORS
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),

  // File Upload
  FILE_UPLOAD: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedTypes: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif').split(','),
  },

  // Payment Gateway
  STRIPE: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
  },

  // Email/SMTP
  SMTP: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
