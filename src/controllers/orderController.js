const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderItems } = req.body;

    let totalPrice = 0;
    const createdOrderItems = [];

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.productId} not found` });
      }

      totalPrice += product.price * item.quantity;

      createdOrderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        status: 'PENDING',
        totalPrice,
        orderItems: {
          create: createdOrderItems,
        },
      },
      include: {
        orderItems: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
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
    res.status(500).json({ error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

