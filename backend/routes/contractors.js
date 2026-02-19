const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../server');

const router = express.Router();

// GET all contractors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contractors WHERE active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single contractor
router.get('/:id', async (req, res) => {
  try {
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

// POST create new contractor
router.post('/', async (req, res) => {
  try {
    const {
      name,
      trade,
      phone,
      email,
      company,
      calendar_id,
      crew,
      notes
    } = req.body;

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

// PUT update contractor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      trade,
      phone,
      email,
      company,
      calendar_id,
      crew,
      notes,
      active
    } = req.body;

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

// DELETE contractor (soft delete)
router.delete('/:id', async (req, res) => {
  try {
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

module.exports = router;
