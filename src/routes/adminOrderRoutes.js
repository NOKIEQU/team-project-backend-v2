const express = require('express');
const adminOrderController = require('../controllers/adminOrderController');
const { adminAuth } = require('../middleware/auth');
const {
  updateOrderStatusValidationRules,
} = require('../validations/orderValidations');

const router = express.Router();

// Middleware to ensure admin authentication for all routes
router.use(adminAuth);

// Get all orders
router.get('/', adminOrderController.getOrderList);

// Get details of a specific order
router.get('/:orderId', adminOrderController.getOrderDetails);

// Update the status of an order
router.patch(
  '/:orderId',
  updateOrderStatusValidationRules,
  adminOrderController.updateOrderStatus
);

// Delete an order
router.delete('/:orderId', adminOrderController.deleteOrder);

// Export the router
module.exports = router;
