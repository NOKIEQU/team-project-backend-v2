const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');
const { body } = require('express-validator');

router.get('/', inventoryController.getInventory);

router.patch(
  '/update',
  adminAuth,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be positive'),
  ],
  inventoryController.updateStock
);

module.exports = router;
