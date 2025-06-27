const db = require('./server/db');

async function addCommissionPaymentStatus() {
  try {
    console.log('Adding status column to commission_payments table...');
    
    // Add status column to track payment allocation progress
    await db.query(`
      ALTER TABLE commission_payments 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'unallocated'
      CHECK (status IN ('unallocated', 'partially_allocated', 'fully_allocated'))
    `);
    console.log('Added status column to commission_payments');
    
    console.log('Commission payment status migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addCommissionPaymentStatus();