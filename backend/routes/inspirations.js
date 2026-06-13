/**
 * Inspirations Gallery Routes
 * Handles fetching inspiration images for customers
 */

module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  const CATEGORIES = [
    'New Builds',
    'Kitchens',
    'Flooring',
    'Fireplaces',
    'Drywall',
    'Decks',
    'Closets',
    'Beams',
    'Bathrooms',
    'Basements'
  ];

  const normalizeCategory = (value = '') => {
    const normalized = String(value).trim().toLowerCase().replace(/[-_]+/g, ' ');
    return CATEGORIES.find(category => category.toLowerCase() === normalized) || value;
  };

  const inspirationSelect = `
    SELECT
      id,
      category,
      title,
      description,
      image_url,
      CASE
        WHEN image_url LIKE '/uploads/inspirations/%'
        THEN REPLACE(image_url, '/uploads/inspirations/', '/uploads/inspirations/thumbs/')
        ELSE image_url
      END AS thumbnail_url,
      created_at
    FROM inspirations
  `;

  // Get all inspirations, optionally filtered by category
  router.get('/', async (req, res) => {
    try {
      const category = req.query.category ? normalizeCategory(req.query.category) : undefined;
      
      let query = `${inspirationSelect} WHERE active = true ORDER BY category, created_at DESC`;
      const params = [];

      if (category && category !== 'all') {
        query = `${inspirationSelect} WHERE category = $1 AND active = true ORDER BY created_at DESC`;
        params.push(category);
      }

      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        count: result.rows.length,
        inspirations: result.rows,
        categories: CATEGORIES
      });
    } catch (err) {
      console.error('Error fetching inspirations:', err);
      res.status(500).json({ error: 'Failed to fetch inspirations' });
    }
  });

  // Get inspirations by category
  router.get('/category/:category', async (req, res) => {
    try {
      const category = normalizeCategory(req.params.category);
      
      const query = `${inspirationSelect} WHERE category = $1 AND active = true ORDER BY created_at DESC`;
      const result = await pool.query(query, [category]);
      
      res.json({
        success: true,
        category,
        count: result.rows.length,
        inspirations: result.rows
      });
    } catch (err) {
      console.error('Error fetching inspirations by category:', err);
      res.status(500).json({ error: 'Failed to fetch inspirations' });
    }
  });

  // Backward-compatible category endpoint used by the customer portal UI.
  router.get('/list/:category', async (req, res) => {
    try {
      const category = normalizeCategory(req.params.category);
      const result = await pool.query(
        `SELECT
           id,
           category,
           title as name,
           description,
           image_url as url,
           image_url,
           CASE
             WHEN image_url LIKE '/uploads/inspirations/%'
             THEN REPLACE(image_url, '/uploads/inspirations/', '/uploads/inspirations/thumbs/')
             ELSE image_url
           END AS thumbnail_url,
           created_at
         FROM inspirations
         WHERE category = $1 AND active = true
         ORDER BY created_at DESC`,
        [category]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching inspiration list:', err);
      res.status(500).json({ error: 'Failed to fetch inspiration list' });
    }
  });

  // Get single inspiration
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `${inspirationSelect} WHERE id = $1 AND active = true`;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inspiration not found' });
      }
      
      res.json({
        success: true,
        inspiration: result.rows[0]
      });
    } catch (err) {
      console.error('Error fetching inspiration:', err);
      res.status(500).json({ error: 'Failed to fetch inspiration' });
    }
  });

  // Add new inspiration (admin only - would need auth)
  router.post('/', async (req, res) => {
    try {
      const { category, title, description, image_url } = req.body;
      
      if (!category || !title || !image_url) {
        return res.status(400).json({ error: 'Missing required fields: category, title, image_url' });
      }

      const query = `
        INSERT INTO inspirations (id, category, title, description, image_url, active, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW())
        RETURNING *
      `;
      
      const result = await pool.query(query, [category, title, description || '', image_url]);
      
      res.status(201).json({
        success: true,
        inspiration: result.rows[0]
      });
    } catch (err) {
      console.error('Error adding inspiration:', err);
      res.status(500).json({ error: 'Failed to add inspiration' });
    }
  });

  // Update inspiration
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { category, title, description, image_url, active } = req.body;

      const query = `
        UPDATE inspirations 
        SET category = COALESCE($1, category),
            title = COALESCE($2, title),
            description = COALESCE($3, description),
            image_url = COALESCE($4, image_url),
            active = COALESCE($5, active)
        WHERE id = $6
        RETURNING *
      `;
      
      const result = await pool.query(query, [category, title, description, image_url, active, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inspiration not found' });
      }
      
      res.json({
        success: true,
        inspiration: result.rows[0]
      });
    } catch (err) {
      console.error('Error updating inspiration:', err);
      res.status(500).json({ error: 'Failed to update inspiration' });
    }
  });

  // Delete inspiration (soft delete - set active to false)
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const query = `
        UPDATE inspirations 
        SET active = false
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inspiration not found' });
      }
      
      res.json({
        success: true,
        message: 'Inspiration deleted',
        inspiration: result.rows[0]
      });
    } catch (err) {
      console.error('Error deleting inspiration:', err);
      res.status(500).json({ error: 'Failed to delete inspiration' });
    }
  });

  return router;
};
