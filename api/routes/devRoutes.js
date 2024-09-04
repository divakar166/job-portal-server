const express = require('express');
const router = express.Router();
const Developer = require('../models/developers');
const { generateToken } = require('../utils/token');
const { authenticateToken } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password} = req.body;
    let developer = await Developer.findOne({ email });

    if (developer) {
      return res.status(400).json({ msg: 'Developer already exists' });
    }
    let name = firstName + ' ' + lastName;

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/developer/verify/${verificationToken}`;

    developer = new Developer({
      name,
      email,
      password,
      verificationToken,
    });

    const { data, error } = await resend.emails.send({
      to: developer.email,
      from: 'info@divakarsingh.online',
      subject: 'Account Verification',
      html: `<p>Please verify your account by clicking on the following link:</p>
              <a href="${verificationUrl}">Verify Account</a>`,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    await developer.save();

    res.status(201).json({ msg: 'Developer registered successfully. Please verify your email.' });
  } catch (err) {
    console.log(err)
    res.status(500).send('Server error');
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token)
    let developer = await Developer.findOne({ verificationToken: token });

    if (!developer) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    developer.isVerified = true;
    developer.verificationToken = undefined;
    await developer.save();

    res.status(200).json({ msg: 'Account verified successfully' });
  } catch (err) {
    res.status(500).json({msg: 'Server error'});
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
    res.json({ token });
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

router.post('/profile', authenticateToken, async (req, res) => {
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
