const express = require('express');
const router = express.Router();
const Developer = require('../models/developers');

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
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const developer = await Developer.findOne({ email });
    console.log('Plain Password:', password);
    console.log('Hashed Password:', developer.password);

    if (!developer) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await developer.verifyPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json({ msg: 'Login successful', developer });
  } catch (err) {
    res.status(500).send(`Server error : ${err.message}`);
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

module.exports = router;
