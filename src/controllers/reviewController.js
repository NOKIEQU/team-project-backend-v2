const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, rating, productId } = req.body;

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        userId: req.user.id,
        productId,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: true },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { content, rating } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { content, rating },
    });

    if (review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review || review.userId !== req.user.id) {
      return res.status(404).json({ error: 'Review not found or not authorized to delete' });
    }

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

