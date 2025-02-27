const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Utility function to verify JWT and fetch user
const verifyTokenAndFetchUser = async (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) {
    throw new Error('User not found');
  }

  return { user, token };
};

// Middleware for general authentication
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Please authenticate.' });
    }

    const { user, token: validatedToken } = await verifyTokenAndFetchUser(
      token
    );

    req.token = validatedToken;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// Middleware for admin authentication
const adminAuth = async (req, res, next) => {
  try {
    // First, authenticate the user
    await auth(req, res, () => {});

    // If auth middleware sends a response (e.g., 401 Unauthorized), stop further execution
    if (res.headersSent) {
      return;
    }

    // Check if the user is an admin
    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Access denied. Admin rights required.' });
    }

    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied. Admin rights required.' });
  }
};

module.exports = { auth, adminAuth };
