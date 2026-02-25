const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth, verifyProjectOwnership } = require('../middleware/customerScope');

const PICTURES_DIR = path.join(__dirname, '..', 'uploads', 'project-pictures');
const DOCUMENTS_DIR = path.join(__dirname, '..', 'uploads', 'project-documents');

// Picture upload config
const pictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(PICTURES_DIR, { recursive: true });
    fs.mkdirSync(path.join(PICTURES_DIR, 'thumbs'), { recursive: true });
    cb(null, PICTURES_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const pictureFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|heic|heif)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and HEIC images are allowed'), false);
  }
};

const pictureUpload = multer({
  storage: pictureStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: pictureFilter
});

// Document upload config
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
    cb(null, DOCUMENTS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const documentFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: documentFilter
});

module.exports = (pool) => {
  const router = express.Router();
  router.use(optionalAuth);

  // ===== PROJECT PICTURES =====

  router.get('/:projectId/pictures', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_project_pictures WHERE project_id = $1 ORDER BY uploaded_at DESC',
        [req.params.projectId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/:projectId/pictures', verifyProjectOwnership(pool), pictureUpload.array('photos', 20), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      const results = [];
      for (const file of req.files) {
        let thumbnailPath = null;
        try {
          const sharp = require('sharp');
          const thumbName = `thumb_${file.filename.replace(/\.heic$/i, '.jpg')}`;
          await sharp(file.path)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(path.join(PICTURES_DIR, 'thumbs', thumbName));
          thumbnailPath = thumbName;
        } catch (e) {
          console.warn('Thumbnail generation failed:', e.message);
        }
        const result = await pool.query(
          `INSERT INTO customer_project_pictures (project_id, uploaded_by, file_name, file_path, thumbnail_path, file_size, mime_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [req.params.projectId, req.userId || null, file.originalname, file.filename, thumbnailPath, file.size, file.mimetype]
        );
        results.push(result.rows[0]);
      }
      res.status(201).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:projectId/pictures/:photoId', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const photo = await pool.query(
        'SELECT * FROM customer_project_pictures WHERE id = $1 AND project_id = $2',
        [req.params.photoId, req.params.projectId]
      );
      if (photo.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

      const row = photo.rows[0];
      const filePath = path.join(PICTURES_DIR, row.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (row.thumbnail_path) {
        const thumbPath = path.join(PICTURES_DIR, 'thumbs', row.thumbnail_path);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      }

      await pool.query('DELETE FROM customer_project_pictures WHERE id = $1', [req.params.photoId]);
      res.json({ message: 'Photo deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===== PROJECT DOCUMENTS =====

  router.get('/:projectId/documents', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_project_documents WHERE project_id = $1 ORDER BY uploaded_at DESC',
        [req.params.projectId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/:projectId/documents', verifyProjectOwnership(pool), documentUpload.single('document'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const result = await pool.query(
        `INSERT INTO customer_project_documents (project_id, uploaded_by, file_name, file_path, file_type, file_size)
         VALUES ($1, $2, $3, $4, 'pdf', $5) RETURNING *`,
        [req.params.projectId, req.userId || null, req.file.originalname, req.file.filename, req.file.size]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:projectId/documents/:docId', verifyProjectOwnership(pool), async (req, res) => {
    try {
      const doc = await pool.query(
        'SELECT * FROM customer_project_documents WHERE id = $1 AND project_id = $2',
        [req.params.docId, req.params.projectId]
      );
      if (doc.rows.length === 0) return res.status(404).json({ error: 'Document not found' });

      const filePath = path.join(DOCUMENTS_DIR, doc.rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await pool.query('DELETE FROM customer_project_documents WHERE id = $1', [req.params.docId]);
      res.json({ message: 'Document deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
