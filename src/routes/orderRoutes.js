const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth, adminAuth} = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('orderItems').isArray(),
  body('orderItems.*.productId').notEmpty(),
  body('orderItems.*.quantity').isInt({ min: 1 }),
], orderController.createOrder);

router.get('/', auth, orderController.getOrders);
router.get('/all', adminAuth, orderController.getAdminOrders);
router.get('/:id', auth, orderController.getOrder);
router.patch('/:id/status', auth, orderController.updateOrderStatus);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;

