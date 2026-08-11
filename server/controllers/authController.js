const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// POST /api/auth/login
// Checks username exists, checks password hash matches, returns a JWT token
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      // Deliberately vague message - don't reveal whether it was the username or password that was wrong
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // bcrypt.compare checks the plain password against the stored HASH - the real password is never stored anywhere
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create a signed token containing the user's id and username, valid for 8 hours
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while logging in' });
  }
}

module.exports = { login };
