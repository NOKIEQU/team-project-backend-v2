const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const genreController = require('../controllers/genreController');
const { body, validationResult } = require('express-validator');


router.get('/', genreController.getAllGenres);

router.post('/', adminAuth, [
  body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
  body('name').trim().escape(),
], genreController.createGenre);

router.get('/:id', genreController.getGenre);

router.patch('/:id', adminAuth, genreController.updateGenre);

router.delete('/:id', adminAuth, genreController.deleteGenre);

module.exports = router;

