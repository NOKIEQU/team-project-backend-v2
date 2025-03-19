const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

//ALLOWS FOR ADDING STOCK AND VIEWING INVENTORY LEVELS

exports.getInventory = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        stock: true,
        stockStatus: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: quantity,
        stockStatus: quantity === 0 ? "OUT_OF_STOCK" : "IN_STOCK",
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId,
        changeType: "STOCK_ADDED",
        quantity,
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
