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

  const CUSTOMER_PASSWORD = 'hphomes';

  const normalizeLogin = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const getCustomerLoginName = (customerName = '') => {
    const parts = String(customerName).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';

    // Some project records are named like "Watson Project"; customers should still use "Watson".
    if (parts.length > 1 && normalizeLogin(parts[parts.length - 1]) === 'project') {
      return parts[parts.length - 2];
    }

    return parts[parts.length - 1];
  };

  const findCustomerByLastName = async (loginField) => {
    const normalizedLogin = normalizeLogin(loginField);
    const projectResult = await pool.query(`
      SELECT id, customer_name, customer_email, customer_id
      FROM projects
      ORDER BY created_at DESC
    `);

    const matchingProjects = projectResult.rows.filter(project => (
      normalizeLogin(getCustomerLoginName(project.customer_name)) === normalizedLogin
    ));

    if (matchingProjects.length === 0) {
      const customerResult = await pool.query(`
        SELECT id, name, email
        FROM customers
        ORDER BY "createdAt" DESC
      `);

      const matchingCustomer = customerResult.rows.find(customer => (
        normalizeLogin(getCustomerLoginName(customer.name)) === normalizedLogin
      ));

      if (!matchingCustomer) return null;

      return {
        id: uuidv4(),
        email: matchingCustomer.email || `${normalizedLogin}@hphomeimprovements.local`,
        name: matchingCustomer.name,
        role: 'customer',
        projectIds: [],
        customerRecordId: matchingCustomer.id
      };
    }

    const primaryProject = matchingProjects.find(project => project.customer_id) || matchingProjects[0];

    return {
      id: primaryProject.customer_id || uuidv4(),
      email: primaryProject.customer_email || `${normalizedLogin}@hphomeimprovements.local`,
      name: primaryProject.customer_name,
      role: 'customer',
      projectIds: matchingProjects.map(project => project.id)
    };
  };

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

      const adminLogins = {
        'greg': { password: 'admin2421', name: 'Greg Hutzell', role: 'admin' },
        'zachary': { password: 'admin2421', name: 'Zachary Hutzell', role: 'admin' },
        'drake': { password: 'admin2421', name: 'Drake Hutzell', role: 'admin' },
        'tyler': { password: 'admin2421', name: 'Tyler Hutzell', role: 'admin' }
      };

      const adminUser = adminLogins[normalizeLogin(loginField)];

      let validUser = null;

      if (adminUser) {
        if (adminUser.password !== password) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        validUser = {
          id: uuidv4(),
          email: `${normalizeLogin(loginField)}@hphomeimprovements.com`,
          name: adminUser.name,
          role: adminUser.role,
          projectIds: []
        };
      } else {
        if (normalizeLogin(password) !== CUSTOMER_PASSWORD) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        validUser = await findCustomerByLastName(loginField);
      }

      if (!validUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          userId: validUser.id,
          email: validUser.email,
          role: validUser.role,
          projectIds: validUser.projectIds || [],
          customerRecordId: validUser.customerRecordId || null
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: validUser.id,
          email: validUser.email,
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
