const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    if (!req.file) {
      return res.status(400).json({ error: 'Avatar is required' });
    }

    const avatarPath = `/images/avatars/${req.file.filename}`;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar: avatarPath,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid login credentials');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    const user = req.user;

    updates.forEach((update) => {
      if (update === 'password') {
        user[update] = bcrypt.hashSync(req.body[update], 8);
      } else {
        user[update] = req.body[update];
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: user,
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: `/images/avatars/${req.file.filename}` },
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

