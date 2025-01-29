const express = require('express');
const { body, param } = require('express-validator'); // Import param validator
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/:productId', auth, [
  body('content').notEmpty().withMessage('Content is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('productId').notEmpty().withMessage('Product ID is required'), // Ensure productId is provided, even though we use the param
  param('productId').isString().withMessage('Product ID must be a valid string'), // Validate productId in URL
], reviewController.createReview);

router.get('/:productId', [
  param('productId').isString().withMessage('Product ID must be a valid string'),
], reviewController.getProductReviews);

router.patch('/:id', auth, reviewController.updateReview);

router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
