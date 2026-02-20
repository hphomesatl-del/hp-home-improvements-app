/**
 * Seed admin users for HP Home Improvements
 * Run: node db/seed_admins.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hp_home_improvements'
});

const admins = [
  { name: 'Greg Hutzell',    email: 'greg@hphome.com',    password: 'admin2421' },
  { name: 'Zachary Hutzell', email: 'zachary@hphome.com', password: 'admin2421' },
  { name: 'Drake Hutzell',   email: 'drake@hphome.com',   password: 'admin2421' },
];

async function seedAdmins() {
  try {
    // Run migration first
    const fs = require('fs');
    const migration = fs.readFileSync(__dirname + '/migrations/001_add_rbac.sql', 'utf8');
    await pool.query(migration);
    console.log('✅ Migration applied');

    for (const admin of admins) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [admin.email]);
      if (existing.rows.length > 0) {
        // Update to admin role if exists
        await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', admin.email]);
        console.log(`✅ ${admin.name} already exists — ensured role=admin`);
      } else {
        const hash = await bcrypt.hash(admin.password, 10);
        await pool.query(
          'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), admin.email, hash, admin.name, 'admin']
        );
        console.log(`✅ Created admin: ${admin.name} (${admin.email})`);
      }
    }

    console.log('\n🔐 Admin accounts ready. Default password: admin2421');
    console.log('⚠️  Change passwords in production!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmins();
