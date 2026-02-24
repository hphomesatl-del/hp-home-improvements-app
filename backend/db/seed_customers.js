/**
 * Seed customer login accounts for HP Home Improvements
 * Run: cd backend && node db/seed_customers.js
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

const customers = [
  { login: '2361Ewing',      password: 'Rachford',    name: 'Matt & Meghan Rachford',      addressMatch: '2361 Ewing' },
  { login: '4680Winding',    password: 'Davis',        name: 'Kelly Davis',                  addressMatch: '4680 Winding' },
  { login: '1057Monticello', password: 'Goethals',     name: 'Darinda & Micheal Goethals',   addressMatch: '1057 Monticello' },
  { login: '6170Daffodil',   password: 'ElSakr',       name: 'Freddy & Ashleigh El Sakr',    addressMatch: '6170 Daffodil' },
  { login: '6115Buckeye',    password: 'Martin',       name: 'Ron & Judy Martin',            addressMatch: '6115 Buckeye' },
];

async function seedCustomers() {
  try {
    for (const cust of customers) {
      // Find matching project by address
      const projResult = await pool.query(
        "SELECT id, customer_name, address FROM projects WHERE address ILIKE $1",
        [`%${cust.addressMatch}%`]
      );

      if (projResult.rows.length === 0) {
        console.log(`⚠️  No project found matching "${cust.addressMatch}" — skipping ${cust.name}`);
        continue;
      }

      const project = projResult.rows[0];
      const hash = await bcrypt.hash(cust.password, 10);

      // Check if user already exists with this login
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cust.login]);

      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        // Update password and ensure role
        await pool.query(
          'UPDATE users SET password_hash = $1, name = $2, role = $3 WHERE id = $4',
          [hash, cust.name, 'customer', userId]
        );
        console.log(`✅ Updated existing user: ${cust.login}`);
      } else {
        userId = uuidv4();
        await pool.query(
          'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
          [userId, cust.login, hash, cust.name, 'customer']
        );
        console.log(`✅ Created user: ${cust.login} (${cust.name})`);
      }

      // Link project to this user
      await pool.query(
        'UPDATE projects SET customer_id = $1 WHERE id = $2',
        [userId, project.id]
      );
      console.log(`   🔗 Linked to project: ${project.address}`);
    }

    console.log('\n🔐 Customer accounts ready!');
    console.log('Credentials:');
    for (const c of customers) {
      console.log(`   ${c.name}: Login=${c.login}, Password=${c.password}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

seedCustomers();
