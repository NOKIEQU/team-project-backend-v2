const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Get Full Order List
exports.getOrderList = async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: 'An Internal Server Error occurred while Fetching the Order List',
    });
  }
};

// Get Single Order Details by ID
exports.getOrderDetails = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      error:
        'An Internal Server Error occurred while Fetching the Order Details',
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const orderId = req.params.orderId;

    // Check if the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Return the updated order
    res
      .status(200)
      .json({ message: 'Order status updated successfully', updatedOrder });
  } catch (error) {
    res.status(500).json({
      error:
        'An Internal Server Error occurred while Updating the Order Status',
    });
  }
};

// Delete Order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Check if the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete the order
    const order = await prisma.order.delete({
      where: { id: orderId },
    });

    res.json({ message: 'Order deleted successfully', deletedOrder: order });
  } catch (error) {
    res.status(500).json({
      error: 'An Internal Server Error occurred while Deleting the Order',
    });
  }
};
