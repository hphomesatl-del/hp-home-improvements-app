const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  // Test pool connection
  pool.query('SELECT 1 as test')
    .then(() => console.log('✅ Auth route pool connected'))
    .catch(err => console.log('❌ Auth route pool failed:', err.message));
  const router = express.Router();

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

  // POST register new user
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name, role } = req.body;

      // Validate password length (minimum 6 characters)
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Check if user exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO users (id, email, password_hash, name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, role`,
        [id, email, password_hash, name, 'customer']
      );

      const token = jwt.sign(
        { userId: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: result.rows[0],
        token
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST login
  router.post('/login', async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const loginField = username || email;

      if (!loginField || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
      }

      // HARDCODED logins for production (database optional)
      const validLogins = {
        '790Clover': { password: 'Rice123', name: 'Carlton Rice', role: 'customer' },
        '2100Bishop': { password: 'Ruiz123', name: 'Gerry & Sarah Ruiz', role: 'customer' },
        'rachford': { password: 'Rachford123', name: 'Matt & Meghan Rachford', role: 'customer' },
        'martin': { password: 'Martin123', name: 'Ron & Judy Martin', role: 'customer' },
        'goethals': { password: 'Goethals123', name: 'Darinda & Micheal Goethals', role: 'customer' },
        'kelly': { password: 'Kelly123', name: 'Kelly Davis', role: 'customer' }
      };

      const validUser = validLogins[loginField];
      
      if (!validUser || validUser.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const { v4: uuidv4 } = require('uuid');
      const token = jwt.sign(
        { userId: uuidv4(), email: loginField + '@hphomeimprovements.com', role: validUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: uuidv4(),
          email: loginField + '@hphomeimprovements.com',
          name: validUser.name,
          role: validUser.role
        },
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      console.error('Stack:', err.stack);
      res.status(500).json({ error: err.message || err.toString() || 'Login failed', stack: err.stack });
    }
  });

  // Middleware to verify token
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // GET current user
  router.get('/me', verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, email, name, role FROM users WHERE id = $1',
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
