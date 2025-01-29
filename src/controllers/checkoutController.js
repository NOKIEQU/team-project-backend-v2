const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.checkout = async (req, res) => {
  const userId = req?.user?.id;

  if (!userId) {
    return res.status(400).json({ error: 'Please give proper User ID' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for the user' });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalPrice = cart.cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalPrice,
        orderItems: {
          create: cart.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
