const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth, verifyProjectOwnership } = require('../middleware/customerScope');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'plans');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = (pool) => {
  const router = express.Router();
  router.use(optionalAuth);

  // GET all plans for a project
  router.get('/:id/plans', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM project_plans WHERE project_id = $1 ORDER BY uploaded_at DESC',
        [req.params.id]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST upload plan — admin only
  router.post('/:id/plans', verifyProjectOwnership(pool), upload.single('file'), async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const result = await pool.query(
        'INSERT INTO project_plans (project_id, file_name, file_path) VALUES ($1, $2, $3) RETURNING *',
        [req.params.id, req.file.originalname, req.file.filename]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE plan — admin only
  router.delete('/:id/plans/:planId', verifyProjectOwnership(pool), async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    try {
      const plan = await pool.query('SELECT * FROM project_plans WHERE id = $1', [req.params.planId]);
      if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
      
      const filePath = path.join(__dirname, '..', 'uploads', 'plans', plan.rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      await pool.query('DELETE FROM project_plans WHERE id = $1', [req.params.planId]);
      res.json({ message: 'Plan deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET photos for a trade
  router.get('/:id/photos/:trade', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM project_photos WHERE project_id = $1 AND trade = $2 ORDER BY uploaded_at DESC',
        [req.params.id, req.params.trade]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST upload photo for trade
  const photoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', 'photos');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    }
  });
  const photoUpload = multer({ storage: photoStorage, limits: { fileSize: 20 * 1024 * 1024 } });

  router.post('/:id/photos/:trade', verifyProjectOwnership(pool), photoUpload.single('file'), async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    try {
      const validTrades = ['electric', 'plumbing', 'framing'];
      if (!validTrades.includes(req.params.trade)) {
        return res.status(400).json({ error: 'Invalid trade. Must be: electric, plumbing, or framing' });
      }
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const result = await pool.query(
        'INSERT INTO project_photos (project_id, trade, file_name, file_path) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.params.id, req.params.trade, req.file.originalname, req.file.filename]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE photo — admin only
  router.delete('/:id/photos/:photoId', verifyProjectOwnership(pool), async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    try {
      const photo = await pool.query('SELECT * FROM project_photos WHERE id = $1', [req.params.photoId]);
      if (photo.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
      
      const filePath = path.join(__dirname, '..', 'uploads', 'photos', photo.rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      await pool.query('DELETE FROM project_photos WHERE id = $1', [req.params.photoId]);
      res.json({ message: 'Photo deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
