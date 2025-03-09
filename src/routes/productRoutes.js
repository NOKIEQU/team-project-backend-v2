const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

router.post(
  '/',
  adminAuth,
  upload.array('product', 5),
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('rating').isFloat({ min: 0, max: 5 }),
    body('releaseYear').isInt({ min: 1800, max: new Date().getFullYear() }),
    body('genreId').notEmpty(),
  ],
  productController.createProduct
);

router.patch(
  '/:id',
  adminAuth,
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('rating').optional().isFloat({ min: 0, max: 5 }),
    body('releaseYear')
      .optional()
      .isInt({ min: 1800, max: new Date().getFullYear() }),
    body('genreId').optional().notEmpty(),
  ],
  upload.array('product', 5),
  productController.updateProduct
);

router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
