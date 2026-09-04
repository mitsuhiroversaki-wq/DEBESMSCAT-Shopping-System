const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Seller management
router.get('/sellers', adminController.getAllSellers);
router.get('/sellers/pending', adminController.getPendingSellers);
router.put('/sellers/:sellerId/approve', adminController.approveSeller);
router.put('/sellers/:sellerId/reject', adminController.rejectSeller);
router.delete('/sellers/:sellerId', adminController.deleteSeller);

// User management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);

// Product moderation
router.get('/products/pending', adminController.getPendingProducts);
router.put('/products/:productId/approve', adminController.approveProduct);
router.delete('/products/:productId', adminController.deleteProduct);

// Analytics and reports
router.get('/analytics/dashboard', adminController.getDashboardAnalytics);
router.get('/analytics/sales', adminController.getSalesAnalytics);
router.get('/analytics/users', adminController.getUserAnalytics);

// System management
router.get('/system-status', adminController.getSystemStatus);

module.exports = router;
