const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Creates a new review
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, rating } = req.body;
    const { productId } = req.params;

    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: req.user.id },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You’ve already reviewed this product. You can update your review instead.' });
    }

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        productId,
        userId: req.user.id,
        helpful: 0,
        notHelpful: 0,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Gets all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } }, 
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Users edit their own reviews
exports.updateReview = async (req, res) => {
  try {
    const { content, rating } = req.body;
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { content, rating, edited: true },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upvote or downvote reviews
exports.voteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        helpful: type === 'helpful' ? review.helpful + 1 : review.helpful,
        notHelpful: type === 'notHelpful' ? review.notHelpful + 1 : review.notHelpful,
      },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Users delete their own reviews
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || review.userId !== req.user.id) {
      return res.status(404).json({ error: 'This review doesn’t exist or you don’t have permission to delete it.' });
    }

    await prisma.review.delete({ where: { id } });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admins delete any review
exports.adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({ where: { id } });

    res.json({ message: 'Review has been removed by an admin.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

