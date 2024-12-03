const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('orderItems').isArray(),
  body('orderItems.*.productId').notEmpty(),
  body('orderItems.*.quantity').isInt({ min: 1 }),
], orderController.createOrder);

router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrder);
router.patch('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;

