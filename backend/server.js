const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(morgan('combined')); // Logging

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Serve the browser application from the same public origin as the API.
app.use(express.static(path.join(__dirname, '..')));

// ===== ROUTES =====
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/sellers', require('./routes/sellers'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/admin', require('./routes/admin'));

// ===== HEALTH CHECK =====
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'DEBESMSCAT Shopping API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ===== ERROR HANDLER =====
app.use(require('./middleware/errorHandler'));

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
  ========================================
  DEBESMSCAT Shopping System Backend
  ========================================
  Server: http://localhost:${PORT}
  Environment: ${NODE_ENV}
  Health Check: http://localhost:${PORT}/api/v1/health
  ========================================
  `);
});

module.exports = app;
