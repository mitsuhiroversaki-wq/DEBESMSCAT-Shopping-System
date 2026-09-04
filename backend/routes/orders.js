const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// All order routes require authentication
router.use(authMiddleware);

// Order management
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:orderId/cancel', orderController.cancelOrder);

// Order tracking
router.get('/:orderId/tracking', orderController.getTrackingInfo);

// Checkout
router.post('/checkout', orderController.checkout);
router.post('/payment-confirm', orderController.confirmPayment);

module.exports = router;
