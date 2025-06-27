import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { query } from './db';
import { Company, Customer, Supplier } from './types';

const PORT = process.env.PORT || 5000;
const CLIENT_BUILD_PATH = path.join(__dirname, '../../client/build');

// Helper function to parse request body
const parseBody = (req: http.IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // API routes
    if (pathname?.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      
      if (pathname === '/api/companies' && method === 'GET') {
        const result = await query('SELECT * FROM companies ORDER BY name');
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      } 
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/customers') && method === 'GET') {
        const companyId = pathname.split('/')[3];
        const result = await query('SELECT * FROM customers WHERE company_id = $1 ORDER BY name', [companyId]);
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/customers') && method === 'POST') {
        const companyId = pathname.split('/')[3];
        const body = await parseBody(req);
        const { name, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        const result = await query(
          'INSERT INTO customers (company_id, name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [companyId, name, email || null, phone || null, address || null]
        );
        res.writeHead(201);
        res.end(JSON.stringify(result.rows[0]));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/customers\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const customerId = pathParts[5];
        const body = await parseBody(req);
        const { name, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        const result = await query(
          'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND company_id = $6 RETURNING *',
          [name, email || null, phone || null, address || null, customerId, companyId]
        );
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Customer not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows[0]));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/customers\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const customerId = pathParts[5];
        
        const result = await query(
          'DELETE FROM customers WHERE id = $1 AND company_id = $2 RETURNING id',
          [customerId, companyId]
        );
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Customer not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Customer deleted successfully' }));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/suppliers') && method === 'GET') {
        const companyId = pathname.split('/')[3];
        const result = await query('SELECT * FROM suppliers WHERE company_id = $1 ORDER BY name', [companyId]);
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/suppliers') && method === 'POST') {
        const companyId = pathname.split('/')[3];
        const body = await parseBody(req);
        const { name, contact_person, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        const result = await query(
          'INSERT INTO suppliers (company_id, name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [companyId, name, contact_person || null, email || null, phone || null, address || null]
        );
        res.writeHead(201);
        res.end(JSON.stringify(result.rows[0]));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const supplierId = pathParts[5];
        const body = await parseBody(req);
        const { name, contact_person, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        const result = await query(
          'UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND company_id = $7 RETURNING *',
          [name, contact_person || null, email || null, phone || null, address || null, supplierId, companyId]
        );
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Supplier not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows[0]));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const supplierId = pathParts[5];
        
        const result = await query(
          'DELETE FROM suppliers WHERE id = $1 AND company_id = $2 RETURNING id',
          [supplierId, companyId]
        );
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Supplier not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Supplier deleted successfully' }));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/parts') && method === 'GET') {
        const companyId = pathname.split('/')[3];
        const result = await query('SELECT * FROM parts WHERE company_id = $1 ORDER BY sku', [companyId]);
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/parts') && method === 'POST') {
        const companyId = pathname.split('/')[3];
        const body = await parseBody(req);
        const { supplier_id, sku, name, description, price } = body;
        
        if (!sku || !name || !supplier_id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'SKU, name, and supplier_id are required' }));
          return;
        }
        
        // Verify supplier belongs to the company
        const supplierCheck = await query('SELECT id FROM suppliers WHERE id = $1 AND company_id = $2', [supplier_id, companyId]);
        if (supplierCheck.rows.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid supplier for this company' }));
          return;
        }
        
        try {
          const result = await query(
            'INSERT INTO parts (company_id, supplier_id, sku, name, description, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [companyId, supplier_id, sku, name, description || null, price || null]
          );
          res.writeHead(201);
          res.end(JSON.stringify(result.rows[0]));
        } catch (error: any) {
          if (error.code === '23505') { // Unique constraint violation
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'SKU already exists for this company' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/parts\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const partId = pathParts[5];
        const body = await parseBody(req);
        const { supplier_id, sku, name, description, price } = body;
        
        if (!sku || !name || !supplier_id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'SKU, name, and supplier_id are required' }));
          return;
        }
        
        // Verify supplier belongs to the company
        const supplierCheck = await query('SELECT id FROM suppliers WHERE id = $1 AND company_id = $2', [supplier_id, companyId]);
        if (supplierCheck.rows.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid supplier for this company' }));
          return;
        }
        
        try {
          const result = await query(
            'UPDATE parts SET supplier_id = $1, sku = $2, name = $3, description = $4, price = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND company_id = $7 RETURNING *',
            [supplier_id, sku, name, description || null, price || null, partId, companyId]
          );
          
          if (result.rows.length === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Part not found' }));
            return;
          }
          
          res.writeHead(200);
          res.end(JSON.stringify(result.rows[0]));
        } catch (error: any) {
          if (error.code === '23505') { // Unique constraint violation
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'SKU already exists for this company' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/parts\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const partId = pathParts[5];
        
        const result = await query(
          'DELETE FROM parts WHERE id = $1 AND company_id = $2 RETURNING id',
          [partId, companyId]
        );
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Part not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Part deleted successfully' }));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/sales-orders') && method === 'GET') {
        const companyId = pathname.split('/')[3];
        const result = await query(`
          SELECT so.*, c.name as customer_name,
                 COALESCE(SUM(soi.commission_amount), 0) as total_commission
          FROM sales_orders so 
          JOIN customers c ON so.customer_id = c.id 
          LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
          WHERE so.company_id = $1 
          GROUP BY so.id, c.name
          ORDER BY so.order_date DESC, so.created_at DESC
        `, [companyId]);
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/sales-orders\/\d+$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const orderId = pathParts[5];
        
        // Get sales order with items
        const orderResult = await query(`
          SELECT so.*, c.name as customer_name 
          FROM sales_orders so 
          JOIN customers c ON so.customer_id = c.id 
          WHERE so.id = $1 AND so.company_id = $2
        `, [orderId, companyId]);
        
        if (orderResult.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Sales order not found' }));
          return;
        }
        
        const itemsResult = await query(`
          SELECT soi.*, p.name as part_name, p.sku, s.name as supplier_name
          FROM sales_order_items soi
          JOIN parts p ON soi.part_id = p.id
          JOIN suppliers s ON soi.supplier_id = s.id
          WHERE soi.sales_order_id = $1 AND soi.company_id = $2
          ORDER BY soi.id
        `, [orderId, companyId]);
        
        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        
        res.writeHead(200);
        res.end(JSON.stringify(order));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/sales-orders') && method === 'POST') {
        const companyId = pathname.split('/')[3];
        const body = await parseBody(req);
        const { customer_id, po_number, order_date, status, notes, items } = body;
        
        if (!customer_id || !po_number || !items || items.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'customer_id, po_number, and items are required' }));
          return;
        }
        
        // Verify customer belongs to company
        const customerCheck = await query('SELECT id FROM customers WHERE id = $1 AND company_id = $2', [customer_id, companyId]);
        if (customerCheck.rows.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid customer for this company' }));
          return;
        }
        
        try {
          // Start transaction
          await query('BEGIN');
          
          // Create sales order
          const orderResult = await query(`
            INSERT INTO sales_orders (company_id, customer_id, po_number, order_date, status, notes) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
          `, [companyId, customer_id, po_number, order_date || new Date().toISOString().split('T')[0], status || 'pending', notes || null]);
          
          const salesOrderId = orderResult.rows[0].id;
          
          // Create sales order items
          let totalAmount = 0;
          for (const item of items) {
            // Verify part and supplier belong to company
            const partCheck = await query('SELECT id, price FROM parts WHERE id = $1 AND company_id = $2', [item.part_id, companyId]);
            const supplierCheck = await query('SELECT id FROM suppliers WHERE id = $1 AND company_id = $2', [item.supplier_id, companyId]);
            
            if (partCheck.rows.length === 0 || supplierCheck.rows.length === 0) {
              throw new Error('Invalid part or supplier for this company');
            }
            
            const unitPrice = item.unit_price || partCheck.rows[0].price || 0;
            const commissionPercentage = item.commission_percentage || 0;
            
            await query(`
              INSERT INTO sales_order_items (company_id, sales_order_id, part_id, supplier_id, quantity, unit_price, commission_percentage)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [companyId, salesOrderId, item.part_id, item.supplier_id, item.quantity, unitPrice, commissionPercentage]);
            
            totalAmount += item.quantity * unitPrice;
          }
          
          // Update total amount
          await query('UPDATE sales_orders SET total_amount = $1 WHERE id = $2', [totalAmount, salesOrderId]);
          
          await query('COMMIT');
          
          res.writeHead(201);
          res.end(JSON.stringify(orderResult.rows[0]));
        } catch (error: any) {
          await query('ROLLBACK');
          if (error.code === '23505') { // Unique constraint violation
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'PO number already exists for this customer' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/sales-orders\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const orderId = pathParts[5];
        
        const result = await query(
          'DELETE FROM sales_orders WHERE id = $1 AND company_id = $2 RETURNING id',
          [orderId, companyId]
        );
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Sales order not found' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Sales order deleted successfully' }));
      }
      // Commission Outstanding API endpoints
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-outstanding$/) && method === 'GET') {
        const companyId = pathname.split('/')[3];
        const result = await query(`
          SELECT 
            s.id as supplier_id,
            s.name as supplier_name,
            COALESCE(SUM(soi.commission_amount), 0) as total_commission,
            COALESCE(SUM(ca.allocated_amount), 0) as total_paid,
            COALESCE(SUM(soi.commission_amount), 0) - COALESCE(SUM(ca.allocated_amount), 0) as outstanding_amount,
            COUNT(DISTINCT so.id) as order_count
          FROM suppliers s
          LEFT JOIN sales_order_items soi ON s.id = soi.supplier_id AND soi.company_id = $1
          LEFT JOIN sales_orders so ON soi.sales_order_id = so.id
          LEFT JOIN commission_allocations ca ON soi.id = ca.sales_order_item_id
          WHERE s.company_id = $1
          GROUP BY s.id, s.name
          HAVING COALESCE(SUM(soi.commission_amount), 0) > 0
          ORDER BY outstanding_amount DESC
        `, [companyId]);
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+\/commission-outstanding\/details$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const supplierId = pathParts[5];
        
        const result = await query(`
          SELECT 
            so.id as sales_order_id,
            so.po_number,
            c.name as customer_name,
            so.order_date,
            soi.id as sales_order_item_id,
            p.name as part_name,
            p.sku,
            soi.quantity,
            soi.unit_price,
            soi.commission_percentage,
            soi.commission_amount,
            COALESCE(SUM(ca.allocated_amount), 0) as paid_amount,
            soi.commission_amount - COALESCE(SUM(ca.allocated_amount), 0) as outstanding_amount
          FROM sales_order_items soi
          JOIN sales_orders so ON soi.sales_order_id = so.id
          JOIN customers c ON so.customer_id = c.id
          JOIN parts p ON soi.part_id = p.id
          LEFT JOIN commission_allocations ca ON soi.id = ca.sales_order_item_id
          WHERE soi.company_id = $1 AND soi.supplier_id = $2
          GROUP BY so.id, so.po_number, c.name, so.order_date, soi.id, p.name, p.sku, 
                   soi.quantity, soi.unit_price, soi.commission_percentage, soi.commission_amount
          HAVING soi.commission_amount - COALESCE(SUM(ca.allocated_amount), 0) > 0
          ORDER BY so.order_date DESC, so.po_number
        `, [companyId, supplierId]);
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      // Commission Payment API endpoints
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments$/) && method === 'GET') {
        const companyId = pathname.split('/')[3];
        const result = await query(`
          SELECT 
            cp.id, cp.company_id, cp.supplier_id, cp.payment_date,
            cp.payment_amount as total_amount, cp.payment_reference as reference_number,
            cp.notes, cp.status, cp.created_at, cp.updated_at,
            s.name as supplier_name
          FROM commission_payments cp
          JOIN suppliers s ON cp.supplier_id = s.id
          WHERE cp.company_id = $1
          ORDER BY cp.payment_date DESC
        `, [companyId]);
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments$/) && method === 'POST') {
        const companyId = pathname.split('/')[3];
        const body = await parseBody(req);
        const { supplier_id, payment_date, total_amount, reference_number, notes } = body;
        
        if (!supplier_id || !payment_date || !total_amount) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Supplier ID, payment date, and total amount are required' }));
          return;
        }
        
        // Verify supplier belongs to the company
        const supplierCheck = await query('SELECT id FROM suppliers WHERE id = $1 AND company_id = $2', [supplier_id, companyId]);
        if (supplierCheck.rows.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid supplier for this company' }));
          return;
        }
        
        const result = await query(
          'INSERT INTO commission_payments (company_id, supplier_id, payment_date, payment_amount, payment_reference, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [companyId, supplier_id, payment_date, total_amount, reference_number || null, notes || null, 'unallocated']
        );
        
        res.writeHead(201);
        res.end(JSON.stringify(result.rows[0]));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-allocations$/) && method === 'POST') {
        const companyId = pathname.split('/')[3];
        const body = await parseBody(req);
        const { commission_payment_id, sales_order_item_id, allocated_amount, notes } = body;
        
        if (!commission_payment_id || !sales_order_item_id || !allocated_amount) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Payment ID, sales order item ID, and allocated amount are required' }));
          return;
        }
        
        await query('BEGIN');
        
        try {
          // Verify payment exists and belongs to company
          const paymentCheck = await query('SELECT id, payment_amount as total_amount FROM commission_payments WHERE id = $1 AND company_id = $2', [commission_payment_id, companyId]);
          if (paymentCheck.rows.length === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Payment not found' }));
            return;
          }
          
          // Verify sales order item exists and belongs to company
          const itemCheck = await query('SELECT id, commission_amount FROM sales_order_items WHERE id = $1 AND company_id = $2', [sales_order_item_id, companyId]);
          if (itemCheck.rows.length === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Sales order item not found' }));
            return;
          }
          
          // Insert new allocation
          const result = await query(
            'INSERT INTO commission_allocations (company_id, commission_payment_id, sales_order_item_id, allocated_amount, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [companyId, commission_payment_id, sales_order_item_id, allocated_amount, notes || null]
          );
          
          // Update payment status based on total allocations
          const allocationsResult = await query('SELECT SUM(allocated_amount) as total_allocated FROM commission_allocations WHERE commission_payment_id = $1', [commission_payment_id]);
          const totalAllocated = parseFloat(allocationsResult.rows[0].total_allocated || 0);
          const paymentTotal = parseFloat(paymentCheck.rows[0].total_amount);
          
          let status = 'unallocated';
          if (totalAllocated > 0) {
            status = Math.abs(totalAllocated - paymentTotal) < 0.01 ? 'fully_allocated' : 'partially_allocated';
          }
          
          await query('UPDATE commission_payments SET status = $1 WHERE id = $2', [status, commission_payment_id]);
          
          await query('COMMIT');
          
          res.writeHead(201);
          res.end(JSON.stringify(result.rows[0]));
        } catch (error) {
          await query('ROLLBACK');
          throw error;
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments\/\d+\/allocations$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const paymentId = pathParts[5];
        
        const result = await query(`
          SELECT 
            ca.*,
            so.po_number,
            c.name as customer_name,
            p.name as part_name,
            p.sku,
            soi.commission_amount,
            soi.quantity,
            soi.unit_price,
            soi.commission_percentage
          FROM commission_allocations ca
          JOIN sales_order_items soi ON ca.sales_order_item_id = soi.id
          JOIN sales_orders so ON soi.sales_order_id = so.id
          JOIN customers c ON so.customer_id = c.id
          JOIN parts p ON soi.part_id = p.id
          WHERE ca.commission_payment_id = $1 AND ca.company_id = $2
          ORDER BY so.po_number, p.sku
        `, [paymentId, companyId]);
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+\/payment-allocation-summary$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = pathParts[3];
        const supplierId = pathParts[5];
        
        const result = await query(`
          SELECT 
            cp.id as payment_id,
            cp.payment_date,
            cp.payment_amount as total_amount,
            cp.payment_reference as reference_number,
            cp.status,
            COALESCE(SUM(ca.allocated_amount), 0) as allocated_amount,
            cp.payment_amount - COALESCE(SUM(ca.allocated_amount), 0) as unallocated_amount
          FROM commission_payments cp
          LEFT JOIN commission_allocations ca ON cp.id = ca.commission_payment_id
          WHERE cp.company_id = $1 AND cp.supplier_id = $2
          GROUP BY cp.id, cp.payment_date, cp.payment_amount, cp.payment_reference, cp.status
          ORDER BY cp.payment_date DESC
        `, [companyId, supplierId]);
        
        res.writeHead(200);
        res.end(JSON.stringify(result.rows));
      }
      else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
      }
    }
    // Serve static files from React build
    else {
      let filePath = path.join(CLIENT_BUILD_PATH, pathname === '/' ? 'index.html' : pathname || '');
      
      // If file doesn't exist, serve index.html for client-side routing
      if (!fs.existsSync(filePath)) {
        filePath = path.join(CLIENT_BUILD_PATH, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';

      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      } catch (error) {
        res.writeHead(404);
        res.end('File not found');
      }
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});