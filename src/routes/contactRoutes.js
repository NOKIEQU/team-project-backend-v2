const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('message').notEmpty().withMessage('Message cannot be empty'),
], contactController.createContact);

router.get('/', auth, contactController.getAllContacts);

router.get('/:id', auth, contactController.getContact);

router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;
