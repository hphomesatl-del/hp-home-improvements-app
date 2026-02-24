const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth, verifyProjectOwnership } = require('../middleware/customerScope');

module.exports = (pool) => {
  const router = express.Router();

  router.use(optionalAuth);

  // GET all phases for a project — ownership verified
  router.get('/project/:projectId', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT ph.*, 
                c.name as contractor_name, 
                c.trade as contractor_trade, 
                c.phone as contractor_phone
         FROM phases ph
         LEFT JOIN contractors c ON c.id = ph.contractor_id
         WHERE ph.project_id = $1 
         ORDER BY ph.phase_order`,
        [req.params.projectId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single phase — verify ownership via phase's project
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT ph.*, 
                c.name as contractor_name, 
                c.trade as contractor_trade, 
                c.phone as contractor_phone
         FROM phases ph
         LEFT JOIN contractors c ON c.id = ph.contractor_id
         WHERE ph.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Phase not found' });
      }

      // Ownership check for customers
      if (req.userRole !== 'admin') {
        const phase = result.rows[0];
        const check = await pool.query(
          'SELECT id FROM projects WHERE id = $1 AND (customer_id = $2 OR customer_email = $3)',
          [phase.project_id, req.userId, req.userEmail]
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

  // POST create new phase — admin only
  router.post('/', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const {
        project_id, name, description, contractor_id, phase_order,
        planned_start_day, planned_duration_days, materials, depends_on,
        requires_customer_decision, is_critical_path
      } = req.body;

      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO phases 
         (id, project_id, name, description, contractor_id, phase_order, 
          planned_start_day, planned_duration_days, materials, depends_on, 
          requires_customer_decision, is_critical_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [id, project_id, name, description, contractor_id, phase_order,
         planned_start_day, planned_duration_days, materials, depends_on,
         requires_customer_decision, is_critical_path]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update phase — admin only
  router.put('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const {
        status, planned_start_date, planned_end_date,
        actual_start_date, actual_end_date, notes, is_critical_path
      } = req.body;

      const result = await pool.query(
        `UPDATE phases 
         SET status = COALESCE($2, status),
             planned_start_date = COALESCE($3, planned_start_date),
             planned_end_date = COALESCE($4, planned_end_date),
             actual_start_date = COALESCE($5, actual_start_date),
             actual_end_date = COALESCE($6, actual_end_date),
             notes = COALESCE($7, notes),
             is_critical_path = COALESCE($8, is_critical_path),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, notes, is_critical_path]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Phase not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE phase — admin only
  router.delete('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        'DELETE FROM phases WHERE id = $1 RETURNING id',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Phase not found' });
      }

      res.json({ message: 'Phase deleted', id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
