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

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.title}. Only ${product.stock} left.` });
      }

      totalPrice += product.price * item.quantity;

      createdOrderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          stockStatus: product.stock - item.quantity <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
        },
      });

      await prisma.inventoryLog.create({
        data: {
          productId: item.productId,
          changeType: 'ORDER_PLACED',
          quantity: item.quantity,
        },
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

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'CANCELLED') {
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            stockStatus: 'IN_STOCK',
          },
        });

        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            changeType: 'ORDER_CANCELLED',
            quantity: item.quantity,
          },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    

    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          stockStatus: 'IN_STOCK',
        },
      });

      await prisma.inventoryLog.create({
        data: {
          productId: item.productId,
          changeType: 'ORDER_CANCELLED',
          quantity: item.quantity,
        },
      });
    }

    await prisma.order.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}