require('dotenv').config({ path: './server/.env' });
const db = require('./server/db');

async function updateDemoCommissions() {
  try {
    console.log('Updating existing sales order items with commission percentages...');
    
    // Update existing items with sample commission percentages
    await db.query(`
      UPDATE sales_order_items 
      SET commission_percentage = CASE 
        WHEN supplier_id = 1 THEN 5.0  -- Industrial Components LLC: 5%
        WHEN supplier_id = 2 THEN 8.0  -- Premium Materials Corp: 8%
        WHEN supplier_id = 3 THEN 6.0  -- Logistics Solutions Inc: 6%
        ELSE 0.0
      END
      WHERE commission_percentage = 0.0
    `);
    
    const result = await db.query('SELECT COUNT(*) FROM sales_order_items WHERE commission_percentage > 0');
    console.log(`Updated ${result.rows[0].count} sales order items with commission percentages`);
    
    console.log('Demo data update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Demo data update failed:', error);
    process.exit(1);
  }
}

updateDemoCommissions();