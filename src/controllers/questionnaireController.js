const { validationResult } = require('express-validator');
const prisma = require('../config/prisma');

exports.getQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId },
      include: {
        favoriteGenres: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    res.json({ questionnaire });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createQuestionnaire = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;

    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { userId },
    });

    if (existingQuestionnaire) {
      return res.status(400).json({ error: 'Questionnaire already exists' });
    }

    const { isAdult, gamePlayPreference, favoriteGenres } = req.body;

    const questionnaire = await prisma.questionnaire.create({
      data: {
        userId,
        isAdult,
        gamePlayPreference,
        favoriteGenres: {
          connect: favoriteGenres.map((genreId) => ({ id: genreId })),
        },
      },
      include: {
        favoriteGenres: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ message: 'Questionnaire Added Successfully.', questionnaire });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuestionnaire = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { isAdult, gamePlayPreference, favoriteGenres } = req.body;

    const questionnaire = await prisma.questionnaire.update({
      where: { userId },
      data: {
        isAdult,
        gamePlayPreference,
        favoriteGenres: favoriteGenres
          ? {
              set: favoriteGenres.map((genreId) => ({ id: genreId })),
            }
          : undefined,
      },
      include: {
        favoriteGenres: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ message: 'Questionnaire Updated Successfully.', questionnaire });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId },
    });

    if (!questionnaire) {
      return res.status(400).json({ error: 'Questionnaire not found' });
    }

    await prisma.questionnaire.delete({
      where: { userId },
    });

    res.json({ message: 'Questionnaire Reset Successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
