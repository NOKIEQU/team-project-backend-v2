const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('content').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('productId').notEmpty(),
], reviewController.createReview);

router.get('/product/:productId', reviewController.getProductReviews);
router.patch('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;

