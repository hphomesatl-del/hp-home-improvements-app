const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

module.exports = (pool) => {
  const router = express.Router();

  // Load Google Drive credentials
  let googleAuth;
  const backendPath = path.join(__dirname, '..', 'hphomesatl-service-account.json');
  const credentialsPath = fs.existsSync(backendPath) 
    ? backendPath 
    : (process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../..', 'hphomesatl-service-account.json'));

  if (fs.existsSync(credentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    googleAuth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
  } else {
    console.warn('⚠️ Service account file not found at:', credentialsPath);
  }

  const categoryFolderMap = {
    'kitchens': 'Kitchens',
    'deck': 'Decks',
    'decks': 'Decks',
    'bathroom': 'Bathrooms',
    'bathrooms': 'Bathrooms',
    'fireplace': 'Fireplaces',
    'fireplaces': 'Fireplaces',
    'basements': 'Basements',
    'drywall': 'Drywall',
    'beams': 'Beams',
    'flooring': 'Flooring',
    'new-builds': 'New builds',
    'closets': 'Closets'
  };

  const imageCache = {};
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // GET /api/inspirations/:category
  router.get('/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const folderName = categoryFolderMap[category];

      if (!folderName) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      // Check cache
      if (imageCache[category] && Date.now() - imageCache[category].timestamp < CACHE_TTL) {
        return res.json(imageCache[category].images);
      }

      if (!googleAuth) {
        return res.status(500).json({ error: 'Google Drive not configured' });
      }

      const drive = google.drive({ version: 'v3', auth: googleAuth });

      // Find the Inspirations folder
      const inspirationsFolderRes = await drive.files.list({
        q: "name='Inspirations' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        spaces: 'drive',
        fields: 'files(id, name)',
        pageSize: 1
      });

      if (!inspirationsFolderRes.data.files || inspirationsFolderRes.data.files.length === 0) {
        return res.json([]);
      }

      const inspirationsFolderId = inspirationsFolderRes.data.files[0].id;

      // Find the category folder within Inspirations
      const categoryFolderRes = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${inspirationsFolderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
        pageSize: 1
      });

      if (!categoryFolderRes.data.files || categoryFolderRes.data.files.length === 0) {
        return res.json([]);
      }

      const categoryFolderId = categoryFolderRes.data.files[0].id;

      // Get images from category folder
      const imagesRes = await drive.files.list({
        q: `'${categoryFolderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/gif' or mimeType='image/webp') and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, createdTime)',
        pageSize: 100,
        orderBy: 'createdTime'
      });

      const images = (imagesRes.data.files || []).map(file => ({
        id: file.id,
        name: file.name,
        url: `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/inspirations/image/${file.id}`,
        mimeType: file.mimeType
      }));

      // Cache the results
      imageCache[category] = {
        images,
        timestamp: Date.now()
      };

      res.json(images);
    } catch (err) {
      console.error('Error fetching inspirations:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/inspirations/image/:fileId - Stream image from Google Drive
  router.get('/image/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;

      if (!googleAuth) {
        return res.status(500).json({ error: 'Google Drive not configured' });
      }

      const drive = google.drive({ version: 'v3', auth: googleAuth });

      // Get file metadata
      const fileRes = await drive.files.get({
        fileId: fileId,
        fields: 'mimeType, name'
      });

      // Stream the file
      const file = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      res.setHeader('Content-Type', fileRes.data.mimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('Content-Disposition', `inline; filename="${fileRes.data.name}"`);

      file.data.pipe(res);
      file.data.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).json({ error: 'Failed to stream image' });
      });
    } catch (err) {
      console.error('Error streaming image:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
