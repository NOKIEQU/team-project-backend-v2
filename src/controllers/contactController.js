const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.createContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, contactNumber, message } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        contactNumber,
        message,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    await prisma.contact.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
