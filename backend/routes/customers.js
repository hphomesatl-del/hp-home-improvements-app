module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  // GET all customers - HARDCODED (no database needed)
  router.get('/', (req, res) => {
    res.json([
      {
        id: "03ddbb8d-79d7-4f0b-a2d5-38f792a34506",
        name: "Matt & Meghan Rachford",
        email: "rachford@hphomeimprovements.com",
        phone: "(404) 931-3686",
        address: "2361 Ewing Drive NE, Brookhaven, GA 30319",
        "projectName": "Kitchen & Exterior Renovation",
        "estimateNumber": "#25121",
        budget: 86772.71,
        "startDate": "2026-02-23",
        "endDate": "2026-05-02",
        scope: "Kitchen renovation + Exterior bump out addition + 7 new windows + Hardwood flooring + Full MEP work",
        status: "IN PROGRESS",
        "createdAt": "2026-02-19"
      },
      {
        id: "eb3d3b49-967c-480a-9b89-c2ed629c6ac1",
        name: "Ron & Judy Martin",
        email: "martin@hphomeimprovements.com",
        phone: "(404) 931-3686",
        address: "6115 Buckeye Trail, Loganville, GA 30053",
        "projectName": "Kitchen Remodel",
        "estimateNumber": "#25205",
        budget: 167268.25,
        "startDate": "2025-12-27",
        "endDate": "2026-02-20",
        scope: "Kitchen addition, full bathroom, powder room, concrete ramp, stairs, all MEP work",
        status: "IN PROGRESS",
        "createdAt": "2026-02-19"
      }
    ]);
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
