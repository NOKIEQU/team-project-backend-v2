const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const rootDir = path.resolve('./');

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

  if (req?.files?.length === 0) {
    return res.status(400).json({ errors: 'Please upload at least one image' });
  }

  try {
    const { title, description, price, rating, releaseYear, genreId, ageRating } = req.body;

    // Validate ageRating
    const validAgeRatings = ["THREE", "SEVEN", "TWELVE", "SIXTEEN", "EIGHTEEN"];
    if (!validAgeRatings.includes(ageRating)) {
      return res.status(400).json({ error: "Invalid age rating. Use: THREE, SEVEN, TWELVE, SIXTEEN, EIGHTEEN." });
    }

    // const imageUrls = req.files ? req.files.map(file => `/images/products/${file.filename}`) : [];

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrls: [],
        rating: parseFloat(rating),
        releaseYear: parseInt(releaseYear),
        genreId,
        ageRating, // Added ageRating field
      },
    });

    const productImageDir = path.join(
      rootDir,
      'public',
      'images',
      product.id.toString()
    );
    fs.mkdirSync(productImageDir, { recursive: true });

    const imageUrls = [];

    // Move uploaded images to specific product ID directory
    req.files.forEach((file) => {
      const imagePath = path.join(productImageDir, file.filename);
      fs.renameSync(file.path, imagePath);
      imageUrls.push(`/images/${product.id}/${file.filename}`);
    });

    // Update product with image paths
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { imageUrls },
    });

    res.status(201).json(updatedProduct);
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
    const { title, description, price, rating, releaseYear, genreId, ageRating } =
      req.body;

    let updateData = {
      title,
      description,
      price: price ? parseFloat(price) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      genreId,
    };

    // Validate ageRating if provided
    if (ageRating) {
      const validAgeRatings = ["THREE", "SEVEN", "TWELVE", "SIXTEEN", "EIGHTEEN"];
      if (!validAgeRatings.includes(ageRating)) {
        return res.status(400).json({ error: "Invalid age rating. Use: THREE, SEVEN, TWELVE, SIXTEEN, EIGHTEEN." });
      }
      updateData.ageRating = ageRating;
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(
        (file) => `/images/products/${file.filename}`
      );
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
    console.log(req.params.id);
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};