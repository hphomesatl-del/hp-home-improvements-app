const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth, verifyProjectOwnership } = require('../middleware/customerScope');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'customer-photos');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.mkdirSync(path.join(UPLOAD_DIR, 'thumbs'), { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|gif|webp|heic|heif)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter
});

module.exports = (pool) => {
  const router = express.Router();
  router.use(optionalAuth);

  // GET all photos for a project
  router.get('/:projectId/timeline-photos', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT ctp.*, ph.name as phase_name, ph.phase_order, u.name as uploaded_by_name
         FROM customer_timeline_photos ctp
         LEFT JOIN phases ph ON ph.id = ctp.phase_id
         LEFT JOIN users u ON u.id = ctp.uploaded_by
         WHERE ctp.project_id = $1
         ORDER BY ctp.uploaded_at DESC`,
        [req.params.projectId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST upload photos (multiple)
  router.post('/:projectId/timeline-photos', verifyProjectOwnership(pool), upload.array('photos', 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const { phase_id, caption } = req.body;
      const results = [];

      for (const file of req.files) {
        // Generate thumbnail using sharp
        let thumbnailPath = null;
        try {
          const sharp = require('sharp');
          const thumbName = `thumb_${file.filename}`;
          await sharp(file.path)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(path.join(UPLOAD_DIR, 'thumbs', thumbName));
          thumbnailPath = thumbName;
        } catch (e) {
          // Thumbnail generation failed, continue without it
          console.warn('Thumbnail generation failed:', e.message);
        }

        const result = await pool.query(
          `INSERT INTO customer_timeline_photos 
           (project_id, phase_id, uploaded_by, file_name, file_path, thumbnail_path, caption, file_size, mime_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            req.params.projectId,
            phase_id || null,
            req.userId || null,
            file.originalname,
            file.filename,
            thumbnailPath,
            caption || null,
            file.size,
            file.mimetype
          ]
        );
        results.push(result.rows[0]);
      }

      res.status(201).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update photo caption/phase
  router.put('/:projectId/timeline-photos/:photoId', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const { caption, phase_id } = req.body;
      const result = await pool.query(
        `UPDATE customer_timeline_photos 
         SET caption = COALESCE($1, caption), phase_id = $2
         WHERE id = $3 AND project_id = $4
         RETURNING *`,
        [caption, phase_id || null, req.params.photoId, req.params.projectId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE photo
  router.delete('/:projectId/timeline-photos/:photoId', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const photo = await pool.query(
        'SELECT * FROM customer_timeline_photos WHERE id = $1 AND project_id = $2',
        [req.params.photoId, req.params.projectId]
      );
      if (photo.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

      // Only allow owner or admin to delete
      if (req.userRole !== 'admin' && photo.rows[0].uploaded_by !== req.userId) {
        return res.status(403).json({ error: 'Can only delete your own photos' });
      }

      const row = photo.rows[0];
      const filePath = path.join(UPLOAD_DIR, row.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (row.thumbnail_path) {
        const thumbPath = path.join(UPLOAD_DIR, 'thumbs', row.thumbnail_path);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      }

      await pool.query('DELETE FROM customer_timeline_photos WHERE id = $1', [req.params.photoId]);
      res.json({ message: 'Photo deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
