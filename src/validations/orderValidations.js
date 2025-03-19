const { body, param } = require('express-validator');

// Validation rules for updating order status
const updateOrderStatusValidationRules = [
  param('orderId')
    .isString()
    .withMessage('Order ID must be a string')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('status')
    .isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .withMessage(
      'Invalid status. Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED'
    ),
];
// export all validation rules
module.exports = {
  updateOrderStatusValidationRules,
};
