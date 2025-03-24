const express = require('express');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const genreRoutes = require('./routes/genreRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes'); 
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: '*', // Allow only the frontend origin
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
// Admin Routes
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/inventory', inventoryRoutes); 

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
