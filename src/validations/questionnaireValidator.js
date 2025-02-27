const { body } = require('express-validator');
const prisma = require('../config/prisma');

// Validation rules for creating a questionnaire
const createQuestionnaireValidationRules = [
  body('isAdult').isBoolean().withMessage('isAdult must be a boolean value'),
  body('gamePlayPreference')
    .isIn(['SinglePlayer', 'MultiPlayer'])
    .withMessage(
      'gamePlayPreference must be either SinglePlayer or MultiPlayer'
    ),
  body('favoriteGenres')
    .isArray()
    .withMessage('favoriteGenres must be an array')
    .notEmpty()
    .withMessage('favoriteGenres cannot be empty'),
  body('favoriteGenres.*')
    .isString()
    .withMessage('Each genre ID must be a string')
    .notEmpty()
    .withMessage('Genre IDs cannot be empty')
    .custom(async (genreId) => {
      const genre = await prisma.genre.findUnique({
        where: { id: genreId },
      });
      if (!genre) {
        throw new Error(`Genre with ID ${genreId} does not exist`);
      }
      return true;
    }),
];

// Validation rules for updating a questionnaire
const updateQuestionnaireValidationRules = [
  body('isAdult')
    .optional()
    .isBoolean()
    .withMessage('isAdult must be a boolean value'),
  body('gamePlayPreference')
    .optional()
    .isIn(['SinglePlayer', 'MultiPlayer'])
    .withMessage(
      'gamePlayPreference must be either SinglePlayer or MultiPlayer'
    ),
  body('favoriteGenres')
    .optional()
    .isArray()
    .withMessage('favoriteGenres must be an array'),
  body('favoriteGenres.*')
    .optional()
    .isString()
    .withMessage('Each genre ID must be a string')
    .notEmpty()
    .withMessage('Genre IDs cannot be empty')
    .custom(async (genreId) => {
      const genre = await prisma.genre.findUnique({
        where: { id: genreId },
      });
      if (!genre) {
        throw new Error(`Genre with ID ${genreId} does not exist`);
      }
      return true;
    }),
];

// Export all validation rules
module.exports = {
  createQuestionnaireValidationRules,
  updateQuestionnaireValidationRules,
};
