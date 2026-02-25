/**
 * Seed Carlton Rice project (Estimate #26034)
 * Run: cd backend && node db/seed_project_carlton_rice.js
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
    const estimateNum = '26034';
    
    // Create project
    const result = await pool.query(
      `INSERT INTO projects (
        id, customer_name, customer_email, customer_phone, address, 
        start_date, estimated_budget, status, category, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        projectId,
        'Carlton Rice',
        '790Clover',
        '(404) 931-3686',
        '790 Clover Dr, Social Circle, GA 30025',
        '2026-03-01', // Estimated start (estimate dated 02/14, expires 03/14)
        47769.45,     // Total budget
        'planning',   // Status
        'Major',      // Category (>= $30k)
        'Estimate #26034 - Bathroom remodel (95sf shower + 55sf floor), luxury vinyl flooring (2312sf), new HVAC (5 Ton), interior painting, quarter round trim'
      ]
    );

    const project = result.rows[0];
    console.log(`\n✅ Created project: ${project.id}`);
    console.log(`   Customer: Carlton Rice`);
    console.log(`   Address: ${project.address}`);
    console.log(`   Budget: $${project.estimated_budget}`);
    console.log(`   Status: ${project.status}`);
    
    // Add phases for this bathroom + flooring + HVAC project
    const phases = [
      { order: 1, name: 'Site Work Prep', status: 'pending', days: 1 },
      { order: 2, name: 'Demo', status: 'pending', days: 3 },
      { order: 3, name: 'Framing', status: 'pending', days: 2 },
      { order: 4, name: 'Plumbing & HVAC', status: 'pending', days: 5 },
      { order: 5, name: 'Drywall', status: 'pending', days: 3 },
      { order: 6, name: 'Tile Shower', status: 'pending', days: 5 },
      { order: 7, name: 'Flooring - Carpet', status: 'pending', days: 2 },
      { order: 8, name: 'Flooring - Luxury Vinyl', status: 'pending', days: 3 },
      { order: 9, name: 'Trim & Quarter Round', status: 'pending', days: 2 },
      { order: 10, name: 'Interior Painting', status: 'pending', days: 3 },
      { order: 11, name: 'Final Inspection', status: 'pending', days: 1 }
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

    console.log(`   📅 Added ${phases.length} phases (total ~31 days)`);
    console.log(`   🔗 Login credentials: 790Clover / Rice123`);
    console.log('\n✨ Carlton Rice project ready for production!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

seedProject();
