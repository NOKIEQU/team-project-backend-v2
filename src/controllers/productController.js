const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const rootDir = path.resolve('./');

// Hardcoded server address with port
const serverAddress = "51.77.110.253:3001";

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { genre: true },
    });
    
    // Convert relative image paths to full URLs
    const productsWithFullUrls = products.map(product => {
      return {
        ...product,
        imageUrls: product.imageUrls.map(url => 
          url.startsWith("http://51.77.110.253:3003") ? url : `http://${serverAddress}${url}`
          )
      };
    });
    
    res.json(productsWithFullUrls);
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

    // Convert relative image paths to full URLs
    const productWithFullUrls = {
      ...product,
      imageUrls: product.imageUrls.map(url => 
      url.startsWith("http://51.77.110.253:3003") ? url : `http://${serverAddress}${url}`
      )
    };

    res.json(productWithFullUrls);
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

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrls: [],
        rating: parseFloat(rating),
        releaseYear: parseInt(releaseYear),
        genreId,
        ageRating,
      },
    });

    const productImageDir = path.join(
      rootDir,
      'public',
      'images',
      product.id.toString()
    );
    fs.mkdirSync(productImageDir, { recursive: true });

    const relativeImageUrls = [];
    const fullImageUrls = [];

    // Move uploaded images to specific product ID directory
    req.files.forEach((file) => {
      const imagePath = path.join(productImageDir, file.filename);
      fs.renameSync(file.path, imagePath);
      const relativePath = `/images/${product.id}/${file.filename}`;
      relativeImageUrls.push(relativePath);
      fullImageUrls.push(`http://${serverAddress}${relativePath}`);
    });

    // Update product with relative image paths (for storage)
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { imageUrls: relativeImageUrls },
    });

    // Return product with full URLs
    const responseProduct = {
      ...updatedProduct,
      imageUrls: fullImageUrls
    };

    res.status(201).json(responseProduct);
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

    // If new files are uploaded
    let relativeImageUrls = [];
    if (req.files && req.files.length > 0) {
      const productImageDir = path.join(
        rootDir,
        'public',
        'images',
        req.params.id
      );
      fs.mkdirSync(productImageDir, { recursive: true });
      
      // Move uploaded images
      req.files.forEach((file) => {
        const imagePath = path.join(productImageDir, file.filename);
        fs.renameSync(file.path, imagePath);
        relativeImageUrls.push(`/images/${req.params.id}/${file.filename}`);
      });
      
      updateData.imageUrls = relativeImageUrls;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Convert to full URLs for response
    const responseProduct = {
      ...product,
      imageUrls: product.imageUrls.map(url => `http://${serverAddress}${url}`)
    };

    res.json(responseProduct);
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