const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { cartItems: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          cartItems: {
            create: {
              productId,
              quantity,
            },
          },
        },
        include: { cartItems: true },
      });
    } else {
      const existingItem = cart.cartItems.find(item => item.productId === productId);

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }

      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: { cartItems: true },
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
    });

    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

