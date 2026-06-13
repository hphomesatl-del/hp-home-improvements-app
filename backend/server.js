require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://frontend-gold-ten-70.vercel.app'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients like curl/Postman and configured browser origins.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

function isLocalDatabaseUrl(databaseUrl) {
  try {
    const { hostname } = new URL(databaseUrl);
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch (_) {
    return false;
  }
}

function shouldUseSsl(databaseUrl) {
  if (!databaseUrl) return false;
  if (databaseUrl.includes('sslmode=disable')) return false;
  if (isLocalDatabaseUrl(databaseUrl)) return false;
  return process.env.NODE_ENV === 'production' || databaseUrl.includes('sslmode=require');
}

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
    };
  }

  return {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'hp_home_improvements'
  };
}

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

const initDB = require('./db/init-db');
initDB(pool).catch(err => console.error('DB init failed:', err));

app.locals.pool = pool;

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'ERROR',
      message: err.message,
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: err.message,
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/debug/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT version();');
    res.json({
      status: 'connected',
      postgresVersion: result.rows[0].version,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL)
    });
  } catch (err) {
    res.status(500).json({
      status: 'disconnected',
      error: err.message,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL)
    });
  }
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'HP Home Improvements API is working',
    loginUrl: '/api/auth/login',
    healthUrl: '/api/health',
    status: 'ok'
  });
});

app.get('/status', async (req, res) => {
  try {
    const [projectCount, customerCount, contractorCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM projects'),
      pool.query('SELECT COUNT(*) as count FROM customers'),
      pool.query('SELECT COUNT(*) as count FROM contractors')
    ]);

    res.json({
      status: 'OK',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: {
        projects: parseInt(projectCount.rows[0].count, 10),
        customers: parseInt(customerCount.rows[0].count, 10),
        contractors: parseInt(contractorCount.rows[0].count, 10)
      },
      version: '0.1.0'
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

console.log('Loading API routes...');
app.use('/api/customers', require('./routes/customers')(pool));
app.use('/api/projects', require('./routes/projects')(pool));
app.use('/api/phases', require('./routes/phases')(pool));
app.use('/api/decisions', require('./routes/decisions')(pool));
app.use('/api/contractors', require('./routes/contractors')(pool));
app.use('/api/auth', require('./routes/auth')(pool));
app.use('/api/inspirations', require('./routes/inspirations')(pool));
app.use('/api/projects', require('./routes/plans')(pool));
app.use('/api/admin', require('./routes/admin')(pool));
app.use('/api/projects', require('./routes/customerPhotos')(pool));
app.use('/api/projects', require('./routes/customerProjectUploads')(pool));

const uploadStaticOptions = {
  maxAge: '30d',
  immutable: true,
  etag: true,
  lastModified: true
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), uploadStaticOptions));
app.use('/uploads/customer-photos', express.static(path.join(__dirname, 'uploads', 'customer-photos')));
app.use('/uploads/customer-photos/thumbs', express.static(path.join(__dirname, 'uploads', 'customer-photos', 'thumbs')));
app.use('/uploads/project-pictures', express.static(path.join(__dirname, 'uploads', 'project-pictures')));
app.use('/uploads/project-pictures/thumbs', express.static(path.join(__dirname, 'uploads', 'project-pictures', 'thumbs')));
app.use('/uploads/project-documents', express.static(path.join(__dirname, 'uploads', 'project-documents')));

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HP Home Improvements API running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || (process.env.DATABASE_URL ? 'DATABASE_URL' : 'hp_home_improvements')}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, pool };
