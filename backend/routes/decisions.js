const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth, verifyProjectOwnership, getCustomerProjectIds } = require('../middleware/customerScope');

module.exports = (pool) => {
  const router = express.Router();

  router.use(optionalAuth);

  // GET all decisions for a project — ownership verified
  router.get('/project/:projectId', verifyProjectOwnership(pool), async (req, res) => {
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

  // GET decisions by category — scoped to customer's projects
  router.get('/category/:category', async (req, res) => {
    try {
      if (req.userRole === 'admin') {
        const result = await pool.query(
          'SELECT * FROM customer_decisions WHERE category = $1 ORDER BY deadline',
          [req.params.category]
        );
        return res.json(result.rows);
      }

      // Customer: only their projects' decisions
      const projectIds = await getCustomerProjectIds(pool, req.userId, req.userEmail);
      if (projectIds.length === 0) return res.json([]);

      const result = await pool.query(
        'SELECT * FROM customer_decisions WHERE category = $1 AND project_id = ANY($2) ORDER BY deadline',
        [req.params.category, projectIds]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single decision — verify ownership
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_decisions WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      if (req.userRole !== 'admin') {
        const decision = result.rows[0];
        const check = await pool.query(
          'SELECT id FROM projects WHERE id = $1 AND (customer_id = $2 OR customer_email = $3)',
          [decision.project_id, req.userId, req.userEmail]
        );
        if (check.rows.length === 0) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create new decision — admin only
  router.post('/', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { project_id, category, deadline, notes } = req.body;

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

  // PUT update decision
  router.put('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { status, selections, vendor_info, photos, notes } = req.body;

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
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

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

  // DELETE decision — admin only
  router.delete('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

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
