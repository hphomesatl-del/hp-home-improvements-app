/**
 * Seed Gerry & Sarah Ruiz project (Estimate #26032)
 * Run: cd backend && node db/seed_project_ruiz.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool(
  isProduction 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'hp_home_improvements'
      }
);

async function seedProject() {
  try {
    const projectId = uuidv4();
    const estimateNum = '26032';
    
    // Create project
    const result = await pool.query(
      `INSERT INTO projects (
        id, customer_name, customer_email, customer_phone, address, 
        start_date, estimated_budget, status, estimate_number, 
        designer_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        projectId,
        'Gerry & Sarah Ruiz',
        '2100Bishop',
        '(404) 931-3686',
        '2100 Bishop Creek Dr, Marietta, GA 30062',
        '2026-03-01', // Estimated start (estimate dated 02/07, expires 03/07, accepted 02/23)
        23986.05,     // Total budget
        'planning',   // Status
        estimateNum,
        null,         // designer_id (TLHD per estimate 1-26-26)
        'Estimate #26032 - Hall & Master Bathroom Remodel. Pocket door framing, bathroom tiles (108 sqft floor + 104 sqft walls + 21 sqft shower floor), electrical, plumbing, drywall, trim, painting'
      ]
    );

    const project = result.rows[0];
    console.log(`\n✅ Created project: ${project.id}`);
    console.log(`   Customer: Gerry & Sarah Ruiz`);
    console.log(`   Address: ${project.address}`);
    console.log(`   Budget: $${project.estimated_budget}`);
    console.log(`   Status: ${project.status}`);
    
    // Add phases for this bathroom remodel project
    const phases = [
      { order: 1, name: 'Demo', status: 'pending', days: 2 },
      { order: 2, name: 'Framing', status: 'pending', days: 2 },
      { order: 3, name: 'Electrical Rough', status: 'pending', days: 1 },
      { order: 4, name: 'Plumbing Rough', status: 'pending', days: 2 },
      { order: 5, name: 'Insulation & Drywall', status: 'pending', days: 3 },
      { order: 6, name: 'Trim & Doors', status: 'pending', days: 2 },
      { order: 7, name: 'Painting', status: 'pending', days: 2 },
      { order: 8, name: 'Tile Installation', status: 'pending', days: 4 },
      { order: 9, name: 'Shower Door (lead time: 10 days)', status: 'pending', days: 10 },
      { order: 10, name: 'Cabinets & Countertops (lead time: 10 days)', status: 'pending', days: 10 },
      { order: 11, name: 'Final Plumbing & Electrical', status: 'pending', days: 2 },
      { order: 12, name: 'Final Inspection & Punchout', status: 'pending', days: 1 }
    ];

    let currentDate = new Date('2026-03-01');
    for (const phase of phases) {
      const startDate = new Date(currentDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + phase.days);
      
      await pool.query(
        `INSERT INTO phases (
          id, project_id, phase_order, name, status, 
          planned_start_date, planned_end_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          projectId,
          phase.order,
          phase.name,
          phase.status,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ]
      );
      
      currentDate = endDate;
    }

    console.log(`   📅 Added ${phases.length} phases (including lead times ~52 days)`);
    console.log(`   🔗 Login credentials: 2100Bishop / Ruiz123`);
    console.log('\n✨ Gerry & Sarah Ruiz project ready for production!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

seedProject();
