module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  // GET all customers
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, phone, address, "projectName", "estimateNumber", budget, "startDate", "endDate", scope, status, "createdAt" FROM customers ORDER BY "createdAt" DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET single customer by ID
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, phone, address, "projectName", "estimateNumber", budget, "startDate", "endDate", scope, status, "createdAt" FROM customers WHERE id = $1',
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching customer:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST create new customer
  router.post('/', async (req, res) => {
    try {
      const { name, email, phone, address, projectName, estimateNumber, budget, startDate, endDate, scope } = req.body;
      
      const result = await pool.query(
        'INSERT INTO customers (name, email, phone, address, "projectName", "estimateNumber", budget, "startDate", "endDate", scope, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING id, name, email, phone, address, "projectName", "estimateNumber", budget, "startDate", "endDate", scope, status, "createdAt"',
        [name, email, phone, address, projectName, estimateNumber, budget, startDate, endDate, scope, 'active']
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating customer:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update customer
  router.put('/:id', async (req, res) => {
    try {
      const { name, email, phone, address, projectName, estimateNumber, budget, startDate, endDate, scope, status } = req.body;
      
      const result = await pool.query(
        'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, "projectName" = $5, "estimateNumber" = $6, budget = $7, "startDate" = $8, "endDate" = $9, scope = $10, status = $11 WHERE id = $12 RETURNING id, name, email, phone, address, "projectName", "estimateNumber", budget, "startDate", "endDate", scope, status, "createdAt"',
        [name, email, phone, address, projectName, estimateNumber, budget, startDate, endDate, scope, status, req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating customer:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE customer
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [req.params.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      res.json({ message: 'Customer deleted', id: result.rows[0].id });
    } catch (err) {
      console.error('Error deleting customer:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
