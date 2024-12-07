const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');


router.post('/register', [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], userController.register);

router.post('/login', [
  body('email').isEmail(),
  body('password'),
], userController.login);

router.get('/all', adminAuth, userController.getAllUsers);
router.patch('/:id', adminAuth, userController.updateUser);
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;

