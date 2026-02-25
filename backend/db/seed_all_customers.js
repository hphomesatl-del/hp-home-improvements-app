/**
 * Seed ALL customer login accounts for HP Home Improvements (Railway production)
 */
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:rfVAJKuVQSvEncvdhampZwfKGyoyaqzK@tramway.proxy.rlwy.net:14431/railway',
  ssl: { rejectUnauthorized: false }
});

const customers = [
  { login: '2361Ewing',      password: 'Rachford',   name: 'Matt & Meghan Rachford',       addressMatch: '2361 Ewing' },
  { login: '4680Winding',    password: 'Davis',       name: 'Kelly Davis',                   addressMatch: '4680 Winding' },
  { login: '1057Monticello', password: 'Goethals',   name: 'Darinda & Micheal Goethals',    addressMatch: '1057 Monticello' },
  { login: '6170Daffodil',   password: 'ElSakr',     name: 'Freddy & Ashleigh El Sakr',     addressMatch: '6170 Daffodil' },
  { login: '6115Buckeye',    password: 'Martin',     name: 'Ron & Judy Martin',             addressMatch: '6115 Buckeye' },
  { login: '1620LazyRiver',  password: 'Rogg',       name: 'Carla Rogg',                    addressMatch: '1620 Lazy River' },
  { login: '3767FairHill',   password: 'Carmony',    name: 'Carmony',                       addressMatch: '3767 Fair Hill' },
  { login: '147Sandpine',    password: 'Alexander',  name: 'Alexander',                     addressMatch: '147 Sandpine' },
  { login: '154Sabal',       password: 'Rainer',     name: 'Rainer',                        addressMatch: '154 Sabal' },
  { login: '511BarrierDunes',password: 'Mondak',     name: 'Mondak',                        addressMatch: '511 Barrier Dunes' },
  { login: '790Clover',      password: 'Rice123',    name: 'Carlton Rice',                  addressMatch: '790 Clover' },
];

async function seedCustomers() {
  try {
    // First, list all projects for reference
    const allProjects = await pool.query('SELECT id, customer_name, address FROM projects ORDER BY address');
    console.log(`\n📋 Found ${allProjects.rows.length} projects in database:`);
    allProjects.rows.forEach(p => console.log(`   - ${p.address} (${p.customer_name})`));
    console.log('');

    for (const cust of customers) {
      // Find matching project by address
      const projResult = await pool.query(
        "SELECT id, customer_name, address FROM projects WHERE address ILIKE $1",
        [`%${cust.addressMatch}%`]
      );

      let projectId = null;
      if (projResult.rows.length === 0) {
        console.log(`⚠️  No project found matching "${cust.addressMatch}" — creating user without project link`);
      } else {
        projectId = projResult.rows[0].id;
      }

      const hash = await bcrypt.hash(cust.password, 10);

      // Check if user already exists
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cust.login]);

      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
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

      // Link project if found
      if (projectId) {
        await pool.query('UPDATE projects SET customer_id = $1 WHERE id = $2', [userId, projectId]);
        console.log(`   🔗 Linked to project: ${projResult.rows[0].address}`);
      }
    }

    console.log('\n🔐 All customer accounts ready!');
    console.log('Credentials:');
    for (const c of customers) {
      console.log(`   ${c.name}: Login=${c.login}, Password=${c.password}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

seedCustomers();
