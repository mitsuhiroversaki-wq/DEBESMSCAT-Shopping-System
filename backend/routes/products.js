const express = require('express');
const router = express.Router();
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:productId', productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);

// Protected seller routes
router.post('/', authMiddleware, sellerMiddleware, productController.createProduct);
router.put('/:productId', authMiddleware, sellerMiddleware, productController.updateProduct);
router.delete('/:productId', authMiddleware, sellerMiddleware, productController.deleteProduct);

// Reviews and ratings (authenticated users)
router.post('/:productId/reviews', authMiddleware, productController.addReview);
router.get('/:productId/reviews', productController.getReviews);

module.exports = router;
