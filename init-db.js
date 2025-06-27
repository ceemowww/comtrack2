const fs = require('fs');
const path = require('path');
const db = require('./server/db');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.query(schemaSQL);
    console.log('Schema created successfully');
    
    // Read and execute demo data
    const demoDataSQL = fs.readFileSync(path.join(__dirname, 'demo-data.sql'), 'utf8');
    await db.query(demoDataSQL);
    console.log('Demo data inserted successfully');
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();