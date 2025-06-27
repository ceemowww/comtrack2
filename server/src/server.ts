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