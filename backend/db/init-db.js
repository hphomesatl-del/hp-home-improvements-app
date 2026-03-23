/**
 * Initialize Production Database
 * Runs on server startup to ensure tables and seed data exist
 */

const bcrypt = require('bcryptjs');

module.exports = async (pool) => {
  try {
    console.log('🔍 Initializing database...');

    // Test connection first
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255),
        username VARCHAR(255),
        password_hash VARCHAR(255),
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'customer',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE(email),
        UNIQUE(username)
      )
    `);
    console.log('✅ Users table created/verified');

    // Create customers table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        "projectName" VARCHAR(255),
        "estimateNumber" VARCHAR(50),
        budget DECIMAL(15,2),
        "startDate" DATE,
        "endDate" DATE,
        scope TEXT,
        status VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Customers table created/verified');

    // Check if customer logins exist
    const existingUsers = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'customer'`
    );

    if (parseInt(existingUsers.rows[0].count) === 0) {
      console.log('📝 Seeding customer logins...');

      const customers = [
        { username: '790Clover', password: 'Rice123', name: 'Carlton Rice' },
        { username: '2100Bishop', password: 'Ruiz123', name: 'Gerry & Sarah Ruiz' },
        { username: 'rachford', password: 'Rachford123', name: 'Matt & Meghan Rachford' },
        { username: 'martin', password: 'Martin123', name: 'Ron & Judy Martin' },
        { username: 'goethals', password: 'Goethals123', name: 'Darinda & Micheal Goethals' },
        { username: 'kelly', password: 'Kelly123', name: 'Kelly Davis' }
      ];

      for (const cust of customers) {
        const { v4: uuidv4 } = require('uuid');
        const id = uuidv4();
        const password_hash = await bcrypt.hash(cust.password, 10);

        await pool.query(
          `INSERT INTO users (id, username, email, password_hash, name, role)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (username) DO NOTHING`,
          [id, cust.username, `${cust.username}@hphomeimprovements.com`, password_hash, cust.name, 'customer']
        );
      }

      console.log('✅ Customer logins seeded');
    }

    console.log('✅ Database initialization complete!');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    // Don't crash on init error - let app continue
  }
};
