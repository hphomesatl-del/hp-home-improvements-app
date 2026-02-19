const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (pool) => {
  const router = express.Router();

  // GET all decisions for a project
  router.get('/project/:projectId', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_decisions WHERE project_id = $1 ORDER BY deadline',
        [req.params.projectId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET decisions by category
  router.get('/category/:category', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_decisions WHERE category = $1 ORDER BY deadline',
        [req.params.category]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single decision
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_decisions WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create new decision
  router.post('/', async (req, res) => {
    try {
      const {
        project_id,
        category,
        deadline,
        notes
      } = req.body;

      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO customer_decisions 
         (id, project_id, category, deadline, notes, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [id, project_id, category, deadline, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update decision (selections, vendor info, status)
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        status,
        selections,
        vendor_info,
        photos,
        notes
      } = req.body;

      const result = await pool.query(
        `UPDATE customer_decisions 
         SET status = COALESCE($2, status),
             selections = COALESCE($3, selections),
             vendor_info = COALESCE($4, vendor_info),
             photos = COALESCE($5, photos),
             notes = COALESCE($6, notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, status, selections, vendor_info, photos, notes]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT approve decision
  router.put('/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const { approved_by } = req.body;

      const result = await pool.query(
        `UPDATE customer_decisions 
         SET status = 'approved',
             approved_by = $2,
             approved_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, approved_by]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE decision
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM customer_decisions WHERE id = $1 RETURNING id',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      res.json({ message: 'Decision deleted', id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
