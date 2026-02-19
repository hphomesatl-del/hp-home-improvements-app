const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../server');

const router = express.Router();

// GET all phases for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM phases WHERE project_id = $1 ORDER BY phase_order',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single phase
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM phases WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new phase
router.post('/', async (req, res) => {
  try {
    const {
      project_id,
      name,
      description,
      contractor_id,
      phase_order,
      planned_start_day,
      planned_duration_days,
      materials,
      depends_on,
      requires_customer_decision,
      is_critical_path
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

// PUT update phase
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      planned_start_date,
      planned_end_date,
      actual_start_date,
      actual_end_date,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE phases 
       SET status = COALESCE($2, status),
           planned_start_date = COALESCE($3, planned_start_date),
           planned_end_date = COALESCE($4, planned_end_date),
           actual_start_date = COALESCE($5, actual_start_date),
           actual_end_date = COALESCE($6, actual_end_date),
           notes = COALESCE($7, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, status, planned_start_date, planned_end_date, actual_start_date, actual_end_date, notes]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE phase
router.delete('/:id', async (req, res) => {
  try {
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

module.exports = router;
