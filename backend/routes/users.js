const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All user routes require authentication
router.use(authMiddleware);

// User profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// User addresses
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

// User orders
router.get('/orders', userController.getOrders);

module.exports = router;
