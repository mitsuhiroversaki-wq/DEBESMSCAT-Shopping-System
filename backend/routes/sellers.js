const express = require('express');
const router = express.Router();
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const sellerController = require('../controllers/sellerController');

// Public routes
router.get('/', sellerController.getAllSellers);
router.get('/:sellerId', sellerController.getSellerById);
router.get('/:sellerId/products', sellerController.getSellerProducts);

// Seller registration
router.post('/register', sellerController.registerSeller);

// Protected seller routes
router.use(authMiddleware, sellerMiddleware);

router.get('/:sellerId/dashboard', sellerController.getSellerDashboard);
router.put('/:sellerId', sellerController.updateSellerInfo);
router.get('/:sellerId/analytics', sellerController.getAnalytics);

module.exports = router;
