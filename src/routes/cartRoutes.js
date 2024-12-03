const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/items', auth, [
  body('productId').notEmpty(),
  body('quantity').isInt({ min: 1 }),
], cartController.addToCart);

router.get('/', auth, cartController.getCart);
router.patch('/items/:id', auth, cartController.updateCartItem);
router.delete('/items/:id', auth, cartController.removeFromCart);

module.exports = router;

