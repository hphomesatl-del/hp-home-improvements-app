const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

// Optional auth middleware - sets req.userRole if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.userRole = 'admin'; // Default to admin view when no auth
    return next();
  }
  return authenticateToken(req, res, next);
};

module.exports = (pool) => {
  const router = express.Router();

  // Auth is optional - all routes are publicly accessible
  router.use(optionalAuth);

  // GET all projects — admins see all, customers see only their own
  router.get('/', async (req, res) => {
    try {
      let result;
      // Dynamic status subquery: finds the current phase based on today's date
      const dynamicStatusSubquery = `
        COALESCE(
          (SELECT ph.name
           FROM phases ph
           WHERE ph.project_id = p.id
             AND CURRENT_DATE >= COALESCE(ph.actual_start_date, ph.planned_start_date)::date
             AND CURRENT_DATE <= COALESCE(ph.actual_end_date, ph.planned_end_date)::date
           ORDER BY ph.phase_order ASC
           LIMIT 1),
          CASE
            WHEN CURRENT_DATE < (SELECT MIN(COALESCE(ph2.actual_start_date, ph2.planned_start_date))::date FROM phases ph2 WHERE ph2.project_id = p.id)
              THEN 'Planning'
            WHEN CURRENT_DATE > (SELECT MAX(COALESCE(ph2.actual_end_date, ph2.planned_end_date))::date FROM phases ph2 WHERE ph2.project_id = p.id)
              THEN 'Completed'
            ELSE p.status
          END
        )`;

      if (req.userRole === 'admin') {
        result = await pool.query(`
          SELECT 
            p.*,
            ${dynamicStatusSubquery} as status,
            COALESCE(
              (SELECT CONCAT(ph.phase_order, ': ', ph.name, ' (', ph.status, ')')
               FROM phases ph 
               WHERE ph.project_id = p.id 
               AND ph.status != 'completed'
               ORDER BY ph.phase_order ASC 
               LIMIT 1),
              'No active phases'
            ) as current_phase
          FROM projects p 
          ORDER BY p.created_at DESC
        `);
      } else {
        // Customers only see projects assigned to them
        result = await pool.query(`
          SELECT 
            p.*,
            ${dynamicStatusSubquery} as status,
            COALESCE(
              (SELECT CONCAT(ph.phase_order, ': ', ph.name, ' (', ph.status, ')')
               FROM phases ph 
               WHERE ph.project_id = p.id 
               AND ph.status != 'completed'
               ORDER BY ph.phase_order ASC 
               LIMIT 1),
              'No active phases'
            ) as current_phase
          FROM projects p 
          WHERE p.customer_id = $1 OR p.customer_email = $2
          ORDER BY p.created_at DESC
        `, [req.userId, req.userEmail]);
      }
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single project — admins can view any, customers only their own
  router.get('/:id', async (req, res) => {
    try {
      const projectId = req.params.id;

      let project;
      if (req.userRole === 'admin') {
        project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      } else {
        project = await pool.query(
          'SELECT * FROM projects WHERE id = $1 AND (customer_id = $2 OR customer_email = $3)',
          [projectId, req.userId, req.userEmail]
        );
      }

      if (project.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const phases = await pool.query(
        `SELECT ph.*, 
                c.name as contractor_name, 
                c.trade as contractor_trade, 
                c.phone as contractor_phone
         FROM phases ph
         LEFT JOIN contractors c ON c.id = ph.contractor_id
         WHERE ph.project_id = $1 
         ORDER BY ph.phase_order`,
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

  // POST create new project — admins can create for anyone, customers create for themselves
  router.post('/', async (req, res) => {
    try {
      const {
        customer_name,
        customer_email,
        customer_phone,
        address,
        start_date,
        designer_id,
        estimated_budget,
        customer_id
      } = req.body;

      // Customers can only create projects for themselves
      const assignedCustomerId = req.userRole === 'admin'
        ? (customer_id || null)
        : req.userId;

      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO projects 
         (id, customer_name, customer_email, customer_phone, address, start_date, designer_id, estimated_budget, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [id, customer_name, customer_email, customer_phone, address, start_date, designer_id, estimated_budget, assignedCustomerId]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update project — admins can update any, customers only their own
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Verify ownership for non-admins
      if (req.userRole !== 'admin') {
        const check = await pool.query(
          'SELECT id FROM projects WHERE id = $1 AND (customer_id = $2 OR customer_email = $3)',
          [id, req.userId, req.userEmail]
        );
        if (check.rows.length === 0) {
          return res.status(403).json({ error: 'Not authorized to update this project' });
        }
      }

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

  // DELETE project — admins only
  router.delete('/:id', async (req, res) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required to delete projects' });
      }

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
