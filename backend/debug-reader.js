#!/usr/bin/env node
/**
 * Backend Debug Reader
 * Diagnoses database connection and environment issues
 */

const { Pool } = require('pg');

console.log('🔍 Backend Debug Reader\n');
console.log('═══════════════════════════════════════\n');

// Check environment variables
console.log('📋 ENVIRONMENT VARIABLES:');
console.log('─────────────────────────');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`PORT: ${process.env.PORT || 'NOT SET'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'}`);
console.log(`DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log(`DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
console.log(`DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
console.log();

// Test database connection
console.log('🧪 DATABASE CONNECTION TEST:');
console.log('─────────────────────────');

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

console.log('Pool Configuration:');
if (process.env.DATABASE_URL) {
  console.log(`  Using DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 50)}...`);
} else {
  console.log(`  Using individual DB variables:`);
  console.log(`    Host: ${poolConfig.host}`);
  console.log(`    Port: ${poolConfig.port}`);
  console.log(`    Database: ${poolConfig.database}`);
  console.log(`    User: ${poolConfig.user}`);
}
console.log();

const pool = new Pool(poolConfig);

pool.query('SELECT NOW();')
  .then(result => {
    console.log('✅ Database connection successful!');
    console.log(`   Server time: ${result.rows[0].now}`);
    return pool.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\';');
  })
  .then(result => {
    const tableCount = parseInt(result.rows[0].count);
    console.log(`✅ Database has ${tableCount} tables`);
    return pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;');
  })
  .then(result => {
    console.log('\nTables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log();
    return pool.end();
  })
  .catch(err => {
    console.log(`❌ Database connection failed!`);
    console.log(`   Error: ${err.message}`);
    console.log();
    if (err.code === 'ECONNREFUSED') {
      console.log('⚠️  Cannot connect to database host. Check:');
      console.log('   - Host is correct and accessible');
      console.log('   - Port is correct');
      console.log('   - Database is running');
    } else if (err.code === 'ENOTFOUND') {
      console.log('⚠️  Cannot resolve database host. Check:');
      console.log('   - Host name is correct');
      console.log('   - DNS is resolving correctly');
    } else if (err.code === '28P01') {
      console.log('⚠️  Authentication failed. Check:');
      console.log('   - Username is correct');
      console.log('   - Password is correct');
    }
    process.exit(1);
  });
