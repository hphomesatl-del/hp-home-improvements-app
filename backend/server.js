require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS: Restrict to frontend domains only
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://frontend-gold-ten-70.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// DISABLED: Rate limiting for auth endpoints
// const authLimiter = rateLimit({...});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'hp_home_improvements'
    };
const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database on startup
const initDB = require('./db/init-db');
initDB(pool).catch(err => console.error('DB init failed:', err));

// Make pool available to routes
app.locals.pool = pool;

// Health check - MUST BE BEFORE OTHER ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint - simple hardcoded response
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    customers: [
      { username: '790Clover', password: 'Rice123', name: 'Carlton Rice' },
      { username: '2100Bishop', password: 'Ruiz123', name: 'Gerry & Sarah Ruiz' }
    ],
    loginUrl: '/api/auth/login',
    status: 'production'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/customers', require('./routes/customers')(pool));
app.use('/api/projects', require('./routes/projects')(pool));
app.use('/api/phases', require('./routes/phases')(pool));
app.use('/api/decisions', require('./routes/decisions')(pool));
app.use('/api/contractors', require('./routes/contractors')(pool));
app.use('/api/auth', require('./routes/auth')(pool)); // NO rate limiter - testing
app.use('/api/inspirations', require('./routes/inspirations')(pool));
app.use('/api/projects', require('./routes/plans')(pool));
app.use('/api/admin', require('./routes/admin')(pool));
app.use('/api/projects', require('./routes/customerPhotos')(pool));
app.use('/api/projects', require('./routes/customerProjectUploads')(pool));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/customer-photos', express.static(path.join(__dirname, 'uploads', 'customer-photos')));
app.use('/uploads/customer-photos/thumbs', express.static(path.join(__dirname, 'uploads', 'customer-photos', 'thumbs')));
app.use('/uploads/project-pictures', express.static(path.join(__dirname, 'uploads', 'project-pictures')));
app.use('/uploads/project-pictures/thumbs', express.static(path.join(__dirname, 'uploads', 'project-pictures', 'thumbs')));
app.use('/uploads/project-documents', express.static(path.join(__dirname, 'uploads', 'project-documents')));

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
