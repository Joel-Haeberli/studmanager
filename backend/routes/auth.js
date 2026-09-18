const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const submitted = crypto.createHash('sha256').update(password).digest('base64');
  const stored = process.env.PASSWORD_HASH;

  if (!stored) {
    return res.status(500).json({ error: 'Server not configured: PASSWORD_HASH missing' });
  }

  if (submitted !== stored) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ auth: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

module.exports = router;
