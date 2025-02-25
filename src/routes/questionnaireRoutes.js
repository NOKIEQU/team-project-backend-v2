const express = require('express');
const { auth } = require('../middleware/auth');
const questionnaireController = require('../controllers/questionnaireController');
const {
  createQuestionnaireValidationRules,
  updateQuestionnaireValidationRules,
} = require('../validations/questionnaireValidator');

// Create a new router instance
const router = express.Router();

// Middleware to ensure user authentication for all routes
router.use(auth);

// Get user questionnaire
router.get('/', questionnaireController.getQuestionnaire);
// Add user questionnaire
router.post(
  '/',
  createQuestionnaireValidationRules,
  questionnaireController.createQuestionnaire
);
// Update user questionnaire
router.patch(
  '/',
  updateQuestionnaireValidationRules,
  questionnaireController.updateQuestionnaire
);
// Reset user questionnaire
router.delete('/', questionnaireController.deleteQuestionnaire);

// Export the router
module.exports = router;
