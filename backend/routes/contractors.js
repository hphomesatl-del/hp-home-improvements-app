const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth, getCustomerProjectIds } = require('../middleware/customerScope');

module.exports = (pool) => {
  const router = express.Router();

  router.use(optionalAuth);

  // GET all contractors
  // Admins: all active contractors
  // Customers: only contractors assigned to phases of their project(s)
  router.get('/', async (req, res) => {
    try {
      if (req.userRole === 'admin') {
        const result = await pool.query(
          'SELECT * FROM contractors WHERE active = true ORDER BY name'
        );
        return res.json(result.rows);
      }

      // Customer: get contractors assigned to their project phases
      const projectIds = await getCustomerProjectIds(pool, req.userId, req.userEmail);
      if (projectIds.length === 0) return res.json([]);

      const result = await pool.query(
        `SELECT DISTINCT c.*
         FROM contractors c
         INNER JOIN phases ph ON ph.contractor_id = c.id
         WHERE ph.project_id = ANY($1) AND c.active = true
         ORDER BY c.name`,
        [projectIds]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single contractor
  router.get('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        // Verify this contractor is assigned to one of the customer's projects
        const projectIds = await getCustomerProjectIds(pool, req.userId, req.userEmail);
        const check = await pool.query(
          `SELECT c.id FROM contractors c
           INNER JOIN phases ph ON ph.contractor_id = c.id
           WHERE c.id = $1 AND ph.project_id = ANY($2)`,
          [req.params.id, projectIds]
        );
        if (check.rows.length === 0) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const result = await pool.query(
        'SELECT * FROM contractors WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Contractor not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create new contractor — admin only
  router.post('/', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, trade, phone, email, company, calendar_id, crew, notes } = req.body;

      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO contractors 
         (id, name, trade, phone, email, company, calendar_id, crew, notes, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING *`,
        [id, name, trade, phone, email, company, calendar_id, crew, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update contractor — admin only
  router.put('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { name, trade, phone, email, company, calendar_id, crew, notes, active } = req.body;

      const result = await pool.query(
        `UPDATE contractors 
         SET name = COALESCE($2, name),
             trade = COALESCE($3, trade),
             phone = COALESCE($4, phone),
             email = COALESCE($5, email),
             company = COALESCE($6, company),
             calendar_id = COALESCE($7, calendar_id),
             crew = COALESCE($8, crew),
             notes = COALESCE($9, notes),
             active = COALESCE($10, active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, name, trade, phone, email, company, calendar_id, crew, notes, active]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Contractor not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE contractor — admin only
  router.delete('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        `UPDATE contractors SET active = false WHERE id = $1 RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Contractor not found' });
      }

      res.json({ message: 'Contractor deactivated', id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
