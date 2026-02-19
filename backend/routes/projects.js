const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (pool) => {
  const router = express.Router();

  // GET all projects
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM projects ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single project with all related data
  router.get('/:id', async (req, res) => {
    try {
      const projectId = req.params.id;
      
      const project = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
      );
      
      if (project.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const phases = await pool.query(
        'SELECT * FROM phases WHERE project_id = $1 ORDER BY phase_order',
        [projectId]
      );

      const decisions = await pool.query(
        'SELECT * FROM customer_decisions WHERE project_id = $1',
        [projectId]
      );

      res.json({
        ...project.rows[0],
        phases: phases.rows,
        decisions: decisions.rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create new project
  router.post('/', async (req, res) => {
    try {
      const {
        customer_name,
        customer_email,
        customer_phone,
        address,
        start_date,
        designer_id,
        estimated_budget
      } = req.body;

      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO projects 
         (id, customer_name, customer_email, customer_phone, address, start_date, designer_id, estimated_budget)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id, customer_name, customer_email, customer_phone, address, start_date, designer_id, estimated_budget]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update project
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { customer_name, customer_email, address, status, estimated_budget, actual_budget, notes } = req.body;

      const result = await pool.query(
        `UPDATE projects 
         SET customer_name = COALESCE($2, customer_name),
             customer_email = COALESCE($3, customer_email),
             address = COALESCE($4, address),
             status = COALESCE($5, status),
             estimated_budget = COALESCE($6, estimated_budget),
             actual_budget = COALESCE($7, actual_budget),
             notes = COALESCE($8, notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, customer_name, customer_email, address, status, estimated_budget, actual_budget, notes]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE project
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM projects WHERE id = $1 RETURNING id',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ message: 'Project deleted', id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
