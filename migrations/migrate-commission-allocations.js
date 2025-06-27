const db = require('./server/db');

async function createCommissionAllocationsTable() {
  try {
    console.log('Creating commission_allocations table...');
    
    // Drop the old commission_payment_items table
    await db.query('DROP TABLE IF EXISTS commission_payment_items CASCADE');
    console.log('Dropped old commission_payment_items table');
    
    // Create the new commission_allocations table
    await db.query(`
      CREATE TABLE commission_allocations (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        commission_payment_id INTEGER NOT NULL REFERENCES commission_payments(id) ON DELETE CASCADE,
        sales_order_item_id INTEGER NOT NULL REFERENCES sales_order_items(id) ON DELETE CASCADE,
        allocated_amount DECIMAL(12,2) NOT NULL CHECK (allocated_amount > 0),
        allocation_date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created commission_allocations table');
    
    // Create indexes for performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_allocations_company_id ON commission_allocations(company_id)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_allocations_payment_id ON commission_allocations(commission_payment_id)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_allocations_order_item_id ON commission_allocations(sales_order_item_id)
    `);
    console.log('Created indexes for commission_allocations');
    
    console.log('Commission allocations migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

createCommissionAllocationsTable();