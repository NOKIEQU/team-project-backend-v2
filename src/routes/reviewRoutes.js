const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Users post review
router.post('/:productId', auth, [
  body('content').notEmpty().withMessage('Please write something about this product before submitting.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Please give a rating between 1 and 5 stars.'),
], reviewController.createReview);

// Gets reviews for product
router.get('/:productId', reviewController.getProductReviews);

// Edit a review
router.patch('/edit/:id', auth, reviewController.updateReview);

// Upvote or downvote a review
router.patch('/vote/:id', auth, reviewController.voteReview);

// Users delete their own reviews
router.delete('/delete/:id', auth, reviewController.deleteReview);

// Admins delete any review
router.delete('/admin/delete/:id', adminAuth, reviewController.adminDeleteReview);

module.exports = router;
