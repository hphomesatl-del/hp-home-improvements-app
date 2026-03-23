const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Root endpoint for testing
  router.get('/', (req, res) => {
    res.json({ 
      message: 'HP Home Improvements API is running!',
      endpoints: [
        '/api/health',
        '/api/customers',
        '/api/auth/login',
        '/api/projects'
      ],
      status: 'production'
    });
  });

  // GET all customers
  router.get('/list', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM customers LIMIT 50');
      res.json({ customers: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
