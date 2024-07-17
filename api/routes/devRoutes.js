const express = require('express');
const router = express.Router();
const Developer = require('../models/developers');
const { generateToken } = require('../utils/token');
const { authenticateToken } = require('../middleware/authMiddleware');

// Register a new developer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, designation } = req.body;
    let developer = await Developer.findOne({ email });

    if (developer) {
      return res.status(400).json({ msg: 'Developer already exists' });
    }

    developer = new Developer({ name, email, password, mobile, designation });
    await developer.save();

    res.status(201).json({ msg: 'Developer registered successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login a developer
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const developer = await Developer.findOne({ email });
    if (!developer || !developer.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(developer._id, 'developer');
    res.json({ developer, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all developers
router.get('/', async (req, res) => {
  try {
    const developers = await Developer.find();
    res.json(developers);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Fetch a developer by ID
router.get('/:id', async (req, res) => {
  try {
    const developer = await Developer.findById(req.params.id);

    if (!developer) {
      return res.status(404).json({ msg: 'Developer not found' });
    }

    res.json(developer);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Developer not found' });
    }
    res.status(500).send('Server error');
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'developer') {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    const developer = await Developer.findById(req.user.id);
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json(developer);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
