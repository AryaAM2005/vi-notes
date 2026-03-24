const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../users.json');

// Ensure users.json exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

// @route POST api/auth/register
// @desc Register user
// @access Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const fileData = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(fileData);

    const userExists = users.find(u => u.email === email || u.username === username);
    if (userExists) return res.status(400).json({ msg: 'User already exists using this email or username' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({
      msg: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route POST api/auth/login
// @desc Auth user and get token
// @access Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const fileData = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(fileData);

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Sign JWT
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_123';
    jwt.sign(
      { id: user.id },
      secret,
      { expiresIn: 3600 * 24 }, // 24 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
