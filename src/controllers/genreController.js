const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.createGenre = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    const genre = await prisma.genre.create({
      data: { name },
    });

    res.status(201).json(genre);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllGenres = async (req, res) => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGenre = async (req, res) => {
  try {
    const genre = await prisma.genre.findUnique({
      where: { id: req.params.id },
    });

    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    res.json(genre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGenre = async (req, res) => {
  try {
    const { name } = req.body;

    const genre = await prisma.genre.update({
      where: { id: req.params.id },
      data: { name },
    });

    res.json(genre);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    await prisma.genre.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

