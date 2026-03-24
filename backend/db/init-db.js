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

    // Create inspirations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inspirations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Inspirations table created/verified');

    // Check if inspirations exist
    const existingInspirations = await pool.query(
      `SELECT COUNT(*) FROM inspirations`
    );

    if (parseInt(existingInspirations.rows[0].count) === 0) {
      console.log('📸 Seeding inspirations gallery...');

      const inspirations = [
        // Kitchens
        { category: 'Kitchens', title: 'Modern White Kitchen', description: 'Clean white cabinetry with stainless steel appliances', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop' },
        { category: 'Kitchens', title: 'Warm Wood Kitchen', description: 'Natural wood finishes with warm lighting', image_url: 'https://images.unsplash.com/photo-1556438991-f4ab0f59f56b?w=500&h=500&fit=crop' },
        { category: 'Kitchens', title: 'Farmhouse Kitchen', description: 'Classic farmhouse style with recessed lighting', image_url: 'https://images.unsplash.com/photo-1513161455079-7ef1a827e252?w=500&h=500&fit=crop' },
        { category: 'Kitchens', title: 'Contemporary Kitchen', description: 'Modern design with sleek finishes', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop' },
        { category: 'Kitchens', title: 'Gourmet Kitchen', description: 'High-end appliances and elegant design', image_url: 'https://images.unsplash.com/photo-1488654715566-71058b63c547?w=500&h=500&fit=crop' },
        
        // Bathrooms
        { category: 'Bathrooms', title: 'Spa-Like Master Bath', description: 'Luxurious master bathroom with soaking tub', image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop' },
        { category: 'Bathrooms', title: 'Modern Bathroom', description: 'Contemporary bathroom with tile and fixtures', image_url: 'https://images.unsplash.com/photo-1552707412-5e55e7f77b67?w=500&h=500&fit=crop' },
        { category: 'Bathrooms', title: 'Guest Bath', description: 'Stylish guest bathroom renovation', image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop' },
        { category: 'Bathrooms', title: 'Walk-In Shower', description: 'Spacious walk-in shower with rainfall head', image_url: 'https://images.unsplash.com/photo-1552707412-5e55e7f77b67?w=500&h=500&fit=crop' },
        
        // Decks
        { category: 'Decks', title: 'Composite Deck', description: 'Low-maintenance composite deck with pergola', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop' },
        { category: 'Decks', title: 'Wood Deck', description: 'Traditional pressure-treated wood deck', image_url: 'https://images.unsplash.com/photo-1576973422550-2173dba999ef?w=500&h=500&fit=crop' },
        { category: 'Decks', title: 'Multi-Level Deck', description: 'Multi-level deck with seating areas', image_url: 'https://images.unsplash.com/photo-1560564589-be147ea4f20f?w=500&h=500&fit=crop' },
        
        // Exteriors
        { category: 'Exteriors', title: 'Siding Replacement', description: 'New fiber cement siding installation', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop' },
        { category: 'Exteriors', title: 'Roof Replacement', description: 'Professional roof replacement project', image_url: 'https://images.unsplash.com/photo-1606594281497-d4fcd2f11d1c?w=500&h=500&fit=crop' },
        { category: 'Exteriors', title: 'Stone Work', description: 'Natural stone exterior accents', image_url: 'https://images.unsplash.com/photo-1576971453615-36dd32e01f1d?w=500&h=500&fit=crop' },
        
        // Basements
        { category: 'Basements', title: 'Finished Basement', description: 'Fully finished basement with bar area', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop' },
        { category: 'Basements', title: 'Basement Entertainment', description: 'Entertainment room with home theater', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop' },
        
        // Additions
        { category: 'Additions', title: 'Room Addition', description: 'Seamless room addition with matching materials', image_url: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=500&h=500&fit=crop' },
        { category: 'Additions', title: 'Master Suite Addition', description: 'Luxurious master suite addition', image_url: 'https://images.unsplash.com/photo-1512559494881-513b2e7e3751?w=500&h=500&fit=crop' }
      ];

      for (const insp of inspirations) {
        await pool.query(
          `INSERT INTO inspirations (category, title, description, image_url, active)
           VALUES ($1, $2, $3, $4, true)
           ON CONFLICT DO NOTHING`,
          [insp.category, insp.title, insp.description, insp.image_url]
        );
      }

      console.log('✅ Inspirations gallery seeded with 20 sample images');
    }

    console.log('✅ Database initialization complete!');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    // Don't crash on init error - let app continue
  }
};
