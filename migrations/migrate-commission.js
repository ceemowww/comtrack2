const db = require('./server/db');

async function migrateCommissionFields() {
  try {
    console.log('Adding commission fields to sales_order_items table...');
    
    // Add commission_percentage column
    await db.query(`
      ALTER TABLE sales_order_items 
      ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2) DEFAULT 0.00 
      CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
    `);
    console.log('Added commission_percentage column');
    
    // Add commission_amount column (calculated field)
    await db.query(`
      ALTER TABLE sales_order_items 
      ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12,2) 
      GENERATED ALWAYS AS (quantity * unit_price * commission_percentage / 100) STORED
    `);
    console.log('Added commission_amount column');
    
    // Create commission payment tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS commission_payments (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
        reference_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created commission_payments table');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS commission_payment_items (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        commission_payment_id INTEGER NOT NULL REFERENCES commission_payments(id) ON DELETE CASCADE,
        sales_order_item_id INTEGER NOT NULL REFERENCES sales_order_items(id) ON DELETE CASCADE,
        paid_amount DECIMAL(12,2) NOT NULL CHECK (paid_amount > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created commission_payment_items table');
    
    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_payments_company_id ON commission_payments(company_id)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_payments_supplier_id ON commission_payments(supplier_id)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_payment_items_company_id ON commission_payment_items(company_id)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_payment_items_payment_id ON commission_payment_items(commission_payment_id)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_commission_payment_items_order_item_id ON commission_payment_items(sales_order_item_id)
    `);
    console.log('Created indexes');
    
    console.log('Commission migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCommissionFields();