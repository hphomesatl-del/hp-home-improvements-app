require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hp_home_improvements'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Make pool available to routes
app.locals.pool = pool;

// Routes
app.use('/api/projects', require('./routes/projects')(pool));
app.use('/api/phases', require('./routes/phases')(pool));
app.use('/api/decisions', require('./routes/decisions')(pool));
app.use('/api/contractors', require('./routes/contractors')(pool));
app.use('/api/auth', require('./routes/auth')(pool));
app.use('/api/inspirations', require('./routes/inspirations')(pool));
app.use('/api/projects', require('./routes/plans')(pool));
app.use('/api/admin', require('./routes/admin')(pool));
app.use('/api/projects', require('./routes/customerPhotos')(pool));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/customer-photos', express.static(path.join(__dirname, 'uploads', 'customer-photos')));
app.use('/uploads/customer-photos/thumbs', express.static(path.join(__dirname, 'uploads', 'customer-photos', 'thumbs')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ HP Home Improvements API running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'hp_home_improvements'}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

module.exports = { app, pool };
