const express = require('express');
const { auth } = require('../middleware/auth');
const checkoutController = require('../controllers/checkoutController');

const router = express.Router();

router.post('/', auth, checkoutController.checkout);

module.exports = router;
