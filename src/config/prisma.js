const { PrismaClient } = require('@prisma/client');

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Export the Prisma client instance
module.exports = prisma;
