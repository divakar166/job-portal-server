const express = require('express');
const router = express.Router();
const Company = require('../models/company');

// Register a new company
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, website, description } = req.body;
    let company = await Company.findOne({ email });

    if (company) {
      return res.status(400).json({ msg: 'Company already exists' });
    }

    company = new Company({
      name,
      email,
      password,
      website,
      description,
      registration_date: new Date(),
      job_opportunities_posted: 0,
      candidates_hired: 0
    });

    await company.save();
    res.status(201).json({ msg: 'Company registered successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login a company
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await company.verifyPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json({ msg: 'Login successful', company });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Fetch all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Fetch a company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }

    res.json(company);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
