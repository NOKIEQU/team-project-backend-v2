const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { genre: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { genre: true, reviews: { include: { user: true } } },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, price, rating, releaseYear, genreId } = req.body;

    const imageUrls = req.files ? req.files.map(file => `/images/products/${file.filename}`) : [];

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrls: JSON.stringify(imageUrls),
        rating: parseFloat(rating),
        releaseYear: parseInt(releaseYear),
        genreId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, price, rating, releaseYear, genreId } = req.body;

    let updateData = {
      title,
      description,
      price: price ? parseFloat(price) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      genreId,
    };

    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/images/products/${file.filename}`);
      updateData.imageUrls = JSON.stringify(imageUrls);
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

