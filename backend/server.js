require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

// Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/phases', require('./routes/phases'));
app.use('/api/decisions', require('./routes/decisions'));
app.use('/api/contractors', require('./routes/contractors'));
app.use('/api/auth', require('./routes/auth'));

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
