import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from './db';
import { Prisma } from '@prisma/client';

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

// Helper function to validate commission calculation inputs
const validateCommissionInputs = (quantity: number, unitPrice: number, commissionPercentage: number) => {
  const errors: string[] = [];
  
  if (quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (unitPrice < 0) {
    errors.push('Unit price cannot be negative');
  }
  
  if (commissionPercentage < 0 || commissionPercentage > 100) {
    errors.push('Commission percentage must be between 0 and 100');
  }
  
  return errors;
};

// Helper function to calculate commission amounts
const calculateCommissionAmounts = (quantity: number, unitPrice: number, commissionPercentage: number) => {
  const lineTotal = quantity * unitPrice;
  const commissionAmount = lineTotal * commissionPercentage / 100;
  return {
    lineTotal,
    commissionAmount
  };
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
      
      // Companies endpoints
      if (pathname === '/api/companies' && method === 'GET') {
        const companies = await prisma.companies.findMany({
          orderBy: { name: 'asc' }
        });
        res.writeHead(200);
        res.end(JSON.stringify(companies));
      } 
      // Customers endpoints
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/customers') && method === 'GET') {
        const companyId = parseInt(pathname.split('/')[3]);
        const customers = await prisma.customers.findMany({
          where: { company_id: companyId },
          orderBy: { name: 'asc' }
        });
        res.writeHead(200);
        res.end(JSON.stringify(customers));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/customers') && method === 'POST') {
        const companyId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const { name, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        const customer = await prisma.customers.create({
          data: {
            company_id: companyId,
            name,
            email: email || null,
            phone: phone || null,
            address: address || null
          }
        });
        res.writeHead(201);
        res.end(JSON.stringify(customer));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/customers\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const customerId = parseInt(pathParts[5]);
        const body = await parseBody(req);
        const { name, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        try {
          const customer = await prisma.customers.update({
            where: { 
              id: customerId,
              company_id: companyId
            },
            data: {
              name,
              email: email || null,
              phone: phone || null,
              address: address || null,
              updated_at: new Date()
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify(customer));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Customer not found' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/customers\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const customerId = parseInt(pathParts[5]);
        
        try {
          await prisma.customers.delete({
            where: { 
              id: customerId,
              company_id: companyId
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Customer deleted successfully' }));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Customer not found' }));
          } else {
            throw error;
          }
        }
      }
      // Suppliers endpoints
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/suppliers') && method === 'GET') {
        const companyId = parseInt(pathname.split('/')[3]);
        const suppliers = await prisma.suppliers.findMany({
          where: { company_id: companyId },
          orderBy: { name: 'asc' }
        });
        res.writeHead(200);
        res.end(JSON.stringify(suppliers));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/suppliers') && method === 'POST') {
        const companyId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const { name, contact_person, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        const supplier = await prisma.suppliers.create({
          data: {
            company_id: companyId,
            name,
            contact_person: contact_person || null,
            email: email || null,
            phone: phone || null,
            address: address || null
          }
        });
        res.writeHead(201);
        res.end(JSON.stringify(supplier));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const supplierId = parseInt(pathParts[5]);
        const body = await parseBody(req);
        const { name, contact_person, email, phone, address } = body;
        
        if (!name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        
        try {
          const supplier = await prisma.suppliers.update({
            where: { 
              id: supplierId,
              company_id: companyId
            },
            data: {
              name,
              contact_person: contact_person || null,
              email: email || null,
              phone: phone || null,
              address: address || null,
              updated_at: new Date()
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify(supplier));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Supplier not found' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const supplierId = parseInt(pathParts[5]);
        
        try {
          await prisma.suppliers.delete({
            where: { 
              id: supplierId,
              company_id: companyId
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Supplier deleted successfully' }));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Supplier not found' }));
          } else {
            throw error;
          }
        }
      }
      // Parts endpoints
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/parts') && method === 'GET') {
        const companyId = parseInt(pathname.split('/')[3]);
        const parts = await prisma.parts.findMany({
          where: { company_id: companyId },
          orderBy: { sku: 'asc' }
        });
        res.writeHead(200);
        res.end(JSON.stringify(parts));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/parts') && method === 'POST') {
        const companyId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const { supplier_id, sku, name, description, price } = body;
        
        if (!sku || !name || !supplier_id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'SKU, name, and supplier_id are required' }));
          return;
        }
        
        // Verify supplier belongs to the company
        const supplier = await prisma.suppliers.findFirst({
          where: { id: supplier_id, company_id: companyId }
        });
        if (!supplier) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid supplier for this company' }));
          return;
        }
        
        try {
          const part = await prisma.parts.create({
            data: {
              company_id: companyId,
              supplier_id,
              sku,
              name,
              description: description || null,
              price: price ? new Prisma.Decimal(price) : null
            }
          });
          res.writeHead(201);
          res.end(JSON.stringify(part));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'SKU already exists for this company' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/parts\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const partId = parseInt(pathParts[5]);
        const body = await parseBody(req);
        const { supplier_id, sku, name, description, price } = body;
        
        if (!sku || !name || !supplier_id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'SKU, name, and supplier_id are required' }));
          return;
        }
        
        // Verify supplier belongs to the company
        const supplier = await prisma.suppliers.findFirst({
          where: { id: supplier_id, company_id: companyId }
        });
        if (!supplier) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid supplier for this company' }));
          return;
        }
        
        try {
          const part = await prisma.parts.update({
            where: { 
              id: partId,
              company_id: companyId
            },
            data: {
              supplier_id,
              sku,
              name,
              description: description || null,
              price: price ? new Prisma.Decimal(price) : null,
              updated_at: new Date()
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify(part));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Part not found' }));
          } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'SKU already exists for this company' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/parts\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const partId = parseInt(pathParts[5]);
        
        try {
          await prisma.parts.delete({
            where: { 
              id: partId,
              company_id: companyId
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Part deleted successfully' }));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Part not found' }));
          } else {
            throw error;
          }
        }
      }
      // Sales Orders endpoints
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/sales-orders') && method === 'GET') {
        const companyId = parseInt(pathname.split('/')[3]);
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const includeItems = url.searchParams.get('include_items') === 'true';
        
        const salesOrders = await prisma.sales_orders.findMany({
          where: { company_id: companyId },
          include: {
            customers: true,
            sales_order_items: includeItems ? {
              include: {
                parts: true,
                suppliers: true
              },
              orderBy: { id: 'asc' }
            } : true
          },
          orderBy: [
            { order_date: 'desc' },
            { created_at: 'desc' }
          ]
        });
        
        // Transform to match existing API response
        const result = salesOrders.map(order => {
          const total_commission = order.sales_order_items.reduce((sum, item) => 
            sum + (item.commission_amount ? parseFloat(item.commission_amount.toString()) : 0), 0
          );
          
          const baseOrder = {
            ...order,
            customer_name: order.customers.name,
            total_commission
          };
          
          if (includeItems) {
            return {
              ...baseOrder,
              items: order.sales_order_items.map(item => ({
                ...item,
                part_name: (item as any).parts.name,
                sku: (item as any).parts.sku,
                supplier_name: (item as any).suppliers.name
              }))
            };
          }
          
          return baseOrder;
        });
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/sales-orders\/\d+$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const orderId = parseInt(pathParts[5]);
        
        const order = await prisma.sales_orders.findFirst({
          where: { 
            id: orderId,
            company_id: companyId
          },
          include: {
            customers: true,
            sales_order_items: {
              include: {
                parts: true,
                suppliers: true
              },
              orderBy: { id: 'asc' }
            }
          }
        });
        
        if (!order) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Sales order not found' }));
          return;
        }
        
        // Transform to match existing API response
        const result = {
          ...order,
          customer_name: order.customers.name,
          items: order.sales_order_items.map(item => ({
            ...item,
            part_name: item.parts.name,
            sku: item.parts.sku,
            supplier_name: item.suppliers.name
          }))
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      else if (pathname?.startsWith('/api/companies/') && pathname.endsWith('/sales-orders') && method === 'POST') {
        const companyId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const { customer_id, po_number, order_date, status, notes, items } = body;
        
        if (!customer_id || !po_number || !items || items.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'customer_id, po_number, and items are required' }));
          return;
        }
        
        // Verify customer belongs to company
        const customer = await prisma.customers.findFirst({
          where: { id: customer_id, company_id: companyId }
        });
        if (!customer) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid customer for this company' }));
          return;
        }
        
        try {
          // Use transaction for atomicity
          const result = await prisma.$transaction(async (tx) => {
            // Create sales order
            const order = await tx.sales_orders.create({
              data: {
                company_id: companyId,
                customer_id,
                po_number,
                order_date: order_date ? new Date(order_date) : new Date(),
                status: status || 'pending',
                notes: notes || null,
                total_amount: 0 // Will update after items
              }
            });
            
            // Create sales order items
            let totalAmount = new Prisma.Decimal(0);
            let totalCommission = new Prisma.Decimal(0);
            for (const item of items) {
              // Verify part and supplier belong to company
              const part = await tx.parts.findFirst({
                where: { id: item.part_id, company_id: companyId }
              });
              const supplier = await tx.suppliers.findFirst({
                where: { id: item.supplier_id, company_id: companyId }
              });
              
              if (!part || !supplier) {
                throw new Error('Invalid part or supplier for this company');
              }
              
              const unitPrice = item.unit_price || part.price || 0;
              const commissionPercentage = item.commission_percentage || 0;
              
              // Validate inputs
              const validationErrors = validateCommissionInputs(item.quantity, unitPrice, commissionPercentage);
              if (validationErrors.length > 0) {
                throw new Error(`Invalid values for part ${part.sku}: ${validationErrors.join(', ')}`);
              }
              
              // Calculate line total and commission amount
              const { lineTotal, commissionAmount } = calculateCommissionAmounts(
                item.quantity, 
                unitPrice, 
                commissionPercentage
              );
              
              await tx.sales_order_items.create({
                data: {
                  company_id: companyId,
                  sales_order_id: order.id,
                  part_id: item.part_id,
                  supplier_id: item.supplier_id,
                  quantity: item.quantity,
                  unit_price: new Prisma.Decimal(unitPrice),
                  line_total: new Prisma.Decimal(lineTotal),
                  commission_percentage: new Prisma.Decimal(commissionPercentage),
                  commission_amount: new Prisma.Decimal(commissionAmount)
                }
              });
              
              totalAmount = totalAmount.add(new Prisma.Decimal(lineTotal));
              totalCommission = totalCommission.add(new Prisma.Decimal(commissionAmount));
            }
            
            // Update totals
            const updatedOrder = await tx.sales_orders.update({
              where: { id: order.id },
              data: { 
                total_amount: totalAmount,
                total_commission: totalCommission
              }
            });
            
            return updatedOrder;
          });
          
          res.writeHead(201);
          res.end(JSON.stringify(result));
        } catch (error: any) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'PO number already exists for this customer' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/sales-orders\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const orderId = parseInt(pathParts[5]);
        
        try {
          await prisma.sales_orders.delete({
            where: { 
              id: orderId,
              company_id: companyId
            }
          });
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Sales order deleted successfully' }));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Sales order not found' }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/sales-orders\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const orderId = parseInt(pathParts[5]);
        const body = await parseBody(req);
        const { customer_id, po_number, order_date, status, notes, items } = body;
        
        if (!customer_id || !po_number || !items || items.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'customer_id, po_number, and items are required' }));
          return;
        }
        
        // Verify customer belongs to company
        const customer = await prisma.customers.findFirst({
          where: { id: customer_id, company_id: companyId }
        });
        if (!customer) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid customer for this company' }));
          return;
        }
        
        try {
          // Use transaction for atomicity
          const result = await prisma.$transaction(async (tx) => {
            // First, verify the order exists and belongs to company
            const existingOrder = await tx.sales_orders.findFirst({
              where: { id: orderId, company_id: companyId }
            });
            if (!existingOrder) {
              throw new Error('Sales order not found');
            }
            
            // Delete existing order items
            await tx.sales_order_items.deleteMany({
              where: { sales_order_id: orderId, company_id: companyId }
            });
            
            // Update sales order
            const order = await tx.sales_orders.update({
              where: { id: orderId },
              data: {
                customer_id,
                po_number,
                order_date: order_date ? new Date(order_date) : existingOrder.order_date,
                status: status || existingOrder.status,
                notes: notes || null,
                total_amount: 0 // Will update after items
              }
            });
            
            // Create new sales order items
            let totalAmount = new Prisma.Decimal(0);
            let totalCommission = new Prisma.Decimal(0);
            for (const item of items) {
              // Verify part and supplier belong to company
              const part = await tx.parts.findFirst({
                where: { id: item.part_id, company_id: companyId }
              });
              const supplier = await tx.suppliers.findFirst({
                where: { id: item.supplier_id, company_id: companyId }
              });
              
              if (!part || !supplier) {
                throw new Error(`Invalid part or supplier: part_id=${item.part_id}, supplier_id=${item.supplier_id}`);
              }
              
              // Server-side calculation (source of truth)
              const quantity = item.quantity;
              const unitPrice = new Prisma.Decimal(item.unit_price);
              const lineTotal = unitPrice.mul(quantity);
              const commissionPercentage = new Prisma.Decimal(item.commission_percentage || 0);
              const commissionAmount = lineTotal.mul(commissionPercentage).div(100);
              
              // Validate ranges
              if (quantity <= 0) {
                throw new Error('Quantity must be positive');
              }
              if (unitPrice.lt(0)) {
                throw new Error('Unit price cannot be negative');
              }
              if (commissionPercentage.lt(0) || commissionPercentage.gt(100)) {
                throw new Error('Commission percentage must be between 0 and 100');
              }
              
              await tx.sales_order_items.create({
                data: {
                  company_id: companyId,
                  sales_order_id: order.id,
                  part_id: item.part_id,
                  supplier_id: item.supplier_id,
                  quantity: quantity,
                  unit_price: unitPrice,
                  line_total: lineTotal,
                  commission_percentage: commissionPercentage,
                  commission_amount: commissionAmount
                }
              });
              
              totalAmount = totalAmount.add(lineTotal);
              totalCommission = totalCommission.add(commissionAmount);
            }
            
            // Update order totals
            const updatedOrder = await tx.sales_orders.update({
              where: { id: order.id },
              data: {
                total_amount: totalAmount,
                total_commission: totalCommission
              }
            });
            
            return updatedOrder;
          });
          
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error: any) {
          if (error.message === 'Sales order not found') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Sales order not found' }));
          } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'PO number already exists for this customer' }));
          } else {
            throw error;
          }
        }
      }
      // Commission Outstanding endpoints
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-outstanding$/) && method === 'GET') {
        const companyId = parseInt(pathname.split('/')[3]);
        
        // Get all suppliers with their commission data
        const suppliers = await prisma.suppliers.findMany({
          where: { company_id: companyId },
          include: {
            sales_order_items: {
              where: {
                commission_amount: { gt: 0 }
              },
              include: {
                commission_allocations: true,
                sales_orders: true
              }
            }
          }
        });
        
        // Calculate commission summary for each supplier
        const result = suppliers
          .map(supplier => {
            const totalCommission = supplier.sales_order_items.reduce((sum, item) => 
              sum + (item.commission_amount ? parseFloat(item.commission_amount.toString()) : 0), 0
            );
            
            const totalPaid = supplier.sales_order_items.reduce((sum, item) => 
              sum + item.commission_allocations.reduce((allocSum, alloc) => 
                allocSum + parseFloat(alloc.allocated_amount.toString()), 0
              ), 0
            );
            
            const orderIds = new Set(supplier.sales_order_items.map(item => item.sales_order_id));
            
            return {
              supplier_id: supplier.id,
              supplier_name: supplier.name,
              total_commission: totalCommission,
              total_paid: totalPaid,
              outstanding_amount: totalCommission - totalPaid,
              order_count: orderIds.size
            };
          })
          .filter(item => item.total_commission > 0)
          .sort((a, b) => b.outstanding_amount - a.outstanding_amount);
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+\/commission-outstanding\/details$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const supplierId = parseInt(pathParts[5]);
        
        const items = await prisma.sales_order_items.findMany({
          where: {
            company_id: companyId,
            supplier_id: supplierId,
            commission_amount: { gt: 0 }
          },
          include: {
            sales_orders: {
              include: {
                customers: true
              }
            },
            parts: true,
            commission_allocations: true
          }
        });
        
        // Transform and filter to match existing API
        const result = items
          .map(item => {
            const paidAmount = item.commission_allocations.reduce((sum, alloc) => 
              sum + parseFloat(alloc.allocated_amount.toString()), 0
            );
            const commissionAmount = item.commission_amount ? parseFloat(item.commission_amount.toString()) : 0;
            const outstandingAmount = commissionAmount - paidAmount;
            
            return {
              sales_order_id: item.sales_order_id,
              po_number: item.sales_orders.po_number,
              customer_name: item.sales_orders.customers.name,
              order_date: item.sales_orders.order_date,
              sales_order_item_id: item.id,
              part_name: item.parts.name,
              sku: item.parts.sku,
              quantity: item.quantity,
              unit_price: item.unit_price,
              commission_percentage: item.commission_percentage,
              commission_amount: commissionAmount,
              paid_amount: paidAmount,
              outstanding_amount: outstandingAmount
            };
          })
          .filter(item => item.outstanding_amount > 0)
          .sort((a, b) => {
            const dateCompare = new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
            return dateCompare !== 0 ? dateCompare : a.po_number.localeCompare(b.po_number);
          });
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      // Commission Payment endpoints
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments$/) && method === 'GET') {
        const companyId = parseInt(pathname.split('/')[3]);
        const payments = await prisma.commission_payments.findMany({
          where: { company_id: companyId },
          include: {
            suppliers: true,
            commission_payment_items: true
          },
          orderBy: { payment_date: 'desc' }
        });
        
        // Transform to match existing API response
        const result = payments.map(payment => {
          const totalLineItems = payment.commission_payment_items.reduce((sum, item) => 
            sum + Number(item.amount), 0
          );
          
          return {
            ...payment,
            total_amount: payment.payment_amount,
            reference_number: payment.payment_reference,
            supplier_name: payment.suppliers.name,
            items: payment.commission_payment_items,
            total_line_items: totalLineItems,
            remaining_amount: Number(payment.payment_amount) - totalLineItems
          };
        });
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments$/) && method === 'POST') {
        const companyId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const { supplier_id, payment_date, total_amount, reference_number, notes } = body;
        
        if (!supplier_id || !payment_date || !total_amount) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Supplier ID, payment date, and total amount are required' }));
          return;
        }
        
        // Verify supplier belongs to the company
        const supplier = await prisma.suppliers.findFirst({
          where: { id: supplier_id, company_id: companyId }
        });
        if (!supplier) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid supplier for this company' }));
          return;
        }
        
        const result = await prisma.$transaction(async (tx) => {
          // Create the payment
          const payment = await tx.commission_payments.create({
            data: {
              company_id: companyId,
              supplier_id,
              payment_date: new Date(payment_date),
              payment_amount: new Prisma.Decimal(total_amount),
              payment_reference: reference_number || null,
              notes: notes || null,
              status: 'unallocated'
            }
          });

          // Create a default payment item with the full amount
          const paymentItem = await tx.commission_payment_items.create({
            data: {
              company_id: companyId,
              commission_payment_id: payment.id,
              amount: new Prisma.Decimal(total_amount),
              description: 'Payment item',
              notes: null
            }
          });

          return { ...payment, items: [paymentItem] };
        });
        
        res.writeHead(201);
        res.end(JSON.stringify(result));
      }
      // Commission Allocations endpoints
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-allocations$/) && method === 'POST') {
        const companyId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const { commission_payment_item_id, sales_order_item_id, allocated_amount, notes } = body;
        
        if (!commission_payment_item_id || !sales_order_item_id || !allocated_amount) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Payment item ID, sales order item ID, and allocated amount are required' }));
          return;
        }
        
        try {
          const result = await prisma.$transaction(async (tx) => {
            // Verify payment item exists and belongs to company
            const paymentItem = await tx.commission_payment_items.findFirst({
              where: { id: commission_payment_item_id, company_id: companyId }
            });
            if (!paymentItem) {
              throw new Error('Payment item not found');
            }
            
            // Verify sales order item exists and belongs to company
            const item = await tx.sales_order_items.findFirst({
              where: { id: sales_order_item_id, company_id: companyId }
            });
            if (!item) {
              throw new Error('Sales order item not found');
            }
            
            // Create allocation
            const allocation = await tx.commission_allocations.create({
              data: {
                company_id: companyId,
                commission_payment_item_id,
                sales_order_item_id,
                allocated_amount: new Prisma.Decimal(allocated_amount),
                notes: notes || null
              }
            });
            
            // Update payment status based on total allocations for the parent payment
            const payment = await tx.commission_payments.findFirst({
              where: { id: paymentItem.commission_payment_id },
              include: {
                commission_payment_items: {
                  include: {
                    commission_allocations: true
                  }
                }
              }
            });
            
            // Calculate total allocated across all payment items
            const totalAllocated = payment?.commission_payment_items.reduce((sum, item) => {
              const itemAllocated = item.commission_allocations.reduce((itemSum, alloc) => 
                itemSum.add(alloc.allocated_amount), new Prisma.Decimal(0)
              );
              return sum.add(itemAllocated);
            }, new Prisma.Decimal(0)) || new Prisma.Decimal(0);
            
            let status = 'unallocated';
            if (totalAllocated.gt(0) && payment) {
              const diff = payment.payment_amount.sub(totalAllocated).abs();
              status = diff.lt(0.01) ? 'fully_allocated' : 'partially_allocated';
            }
            
            if (payment) {
              await tx.commission_payments.update({
                where: { id: paymentItem.commission_payment_id },
                data: { status }
              });
            }
            
            return allocation;
          });
          
          res.writeHead(201);
          res.end(JSON.stringify(result));
        } catch (error: any) {
          if (error.message === 'Payment not found' || error.message === 'Sales order item not found') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: error.message }));
          } else {
            throw error;
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments\/\d+\/allocations$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const paymentId = parseInt(pathParts[5]);
        
        // Get all allocations for payment items belonging to this payment
        const allocations = await prisma.commission_allocations.findMany({
          where: {
            commission_payment_items: {
              commission_payment_id: paymentId,
              company_id: companyId
            },
            company_id: companyId
          },
          include: {
            sales_order_items: {
              include: {
                sales_orders: {
                  include: {
                    customers: true
                  }
                },
                parts: true
              }
            }
          },
          orderBy: [
            { sales_order_items: { sales_orders: { po_number: 'asc' } } },
            { sales_order_items: { parts: { sku: 'asc' } } }
          ]
        });
        
        // Transform to match existing API response
        const result = allocations.map(alloc => ({
          ...alloc,
          po_number: alloc.sales_order_items.sales_orders.po_number,
          customer_name: alloc.sales_order_items.sales_orders.customers.name,
          part_name: alloc.sales_order_items.parts.name,
          sku: alloc.sales_order_items.parts.sku,
          commission_amount: alloc.sales_order_items.commission_amount,
          quantity: alloc.sales_order_items.quantity,
          unit_price: alloc.sales_order_items.unit_price,
          commission_percentage: alloc.sales_order_items.commission_percentage
        }));
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      // Commission Payment Items endpoints
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments\/\d+\/items$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const paymentId = parseInt(pathParts[5]);
        
        const items = await prisma.commission_payment_items.findMany({
          where: {
            commission_payment_id: paymentId,
            company_id: companyId
          },
          orderBy: { created_at: 'asc' }
        });
        
        res.writeHead(200);
        res.end(JSON.stringify(items));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments\/\d+\/items$/) && method === 'POST') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const paymentId = parseInt(pathParts[5]);
        const body = await parseBody(req);
        const { amount, description, notes } = body;
        
        if (!amount) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Amount is required' }));
          return;
        }
        
        try {
          // Verify payment exists and belongs to company
          const payment = await prisma.commission_payments.findFirst({
            where: { id: paymentId, company_id: companyId }
          });
          if (!payment) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Payment not found' }));
            return;
          }
          
          const item = await prisma.commission_payment_items.create({
            data: {
              company_id: companyId,
              commission_payment_id: paymentId,
              amount: new Prisma.Decimal(amount),
              description: description || null,
              notes: notes || null
            }
          });
          
          res.writeHead(201);
          res.end(JSON.stringify(item));
        } catch (error) {
          console.error('Error creating commission payment item:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to create payment item' }));
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments\/\d+\/items\/\d+$/) && method === 'PUT') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const paymentId = parseInt(pathParts[5]);
        const itemId = parseInt(pathParts[7]);
        const body = await parseBody(req);
        const { amount, description, notes } = body;
        
        if (!amount) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Amount is required' }));
          return;
        }
        
        try {
          const item = await prisma.commission_payment_items.update({
            where: {
              id: itemId,
              commission_payment_id: paymentId,
              company_id: companyId
            },
            data: {
              amount: new Prisma.Decimal(amount),
              description: description || null,
              notes: notes || null
            }
          });
          
          res.writeHead(200);
          res.end(JSON.stringify(item));
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Payment item not found' }));
          } else {
            console.error('Error updating commission payment item:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to update payment item' }));
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payments\/\d+\/items\/\d+$/) && method === 'DELETE') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const paymentId = parseInt(pathParts[5]);
        const itemId = parseInt(pathParts[7]);
        
        try {
          await prisma.commission_payment_items.delete({
            where: {
              id: itemId,
              commission_payment_id: paymentId,
              company_id: companyId
            }
          });
          
          res.writeHead(204);
          res.end();
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Payment item not found' }));
          } else {
            console.error('Error deleting commission payment item:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to delete payment item' }));
          }
        }
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/commission-payment-items\/\d+\/allocations$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const paymentItemId = parseInt(pathParts[5]);
        
        const allocations = await prisma.commission_allocations.findMany({
          where: {
            commission_payment_item_id: paymentItemId,
            company_id: companyId
          },
          include: {
            sales_order_items: {
              include: {
                sales_orders: {
                  include: {
                    customers: true
                  }
                },
                parts: true
              }
            }
          },
          orderBy: [
            { sales_order_items: { sales_orders: { po_number: 'asc' } } },
            { sales_order_items: { parts: { sku: 'asc' } } }
          ]
        });
        
        // Transform to match existing API response
        const result = allocations.map(alloc => ({
          ...alloc,
          po_number: alloc.sales_order_items.sales_orders.po_number,
          customer_name: alloc.sales_order_items.sales_orders.customers.name,
          part_name: alloc.sales_order_items.parts.name,
          sku: alloc.sales_order_items.parts.sku,
          commission_amount: alloc.sales_order_items.commission_amount,
          quantity: alloc.sales_order_items.quantity,
          unit_price: alloc.sales_order_items.unit_price,
          commission_percentage: alloc.sales_order_items.commission_percentage
        }));
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+\/commission-summary$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const supplierId = parseInt(pathParts[5]);
        
        // 1. Total Commission Generated (earned by supplier)
        const commissionGenerated = await prisma.sales_order_items.aggregate({
          where: {
            company_id: companyId,
            supplier_id: supplierId,
            commission_amount: { gt: 0 }
          },
          _sum: {
            commission_amount: true
          }
        });
        
        // 2. Total Commission Paid (payments made to supplier)
        const commissionPaid = await prisma.commission_payments.aggregate({
          where: {
            company_id: companyId,
            supplier_id: supplierId
          },
          _sum: {
            payment_amount: true
          }
        });
        
        // 3. Total Commission Allocated (allocations linked to supplier's items)
        const allocations = await prisma.commission_allocations.findMany({
          where: {
            company_id: companyId,
            sales_order_items: {
              supplier_id: supplierId
            }
          }
        });
        
        const totalAllocated = allocations.reduce((sum, alloc) => 
          sum + parseFloat(alloc.allocated_amount.toString()), 0
        );
        
        const totalGenerated = commissionGenerated._sum.commission_amount 
          ? parseFloat(commissionGenerated._sum.commission_amount.toString()) 
          : 0;
        
        const totalPaid = commissionPaid._sum.payment_amount 
          ? parseFloat(commissionPaid._sum.payment_amount.toString()) 
          : 0;
        
        const result = {
          supplier_id: supplierId,
          total_commission_generated: totalGenerated,
          total_commission_paid: totalPaid,
          total_commission_allocated: totalAllocated,
          commission_outstanding: totalGenerated - totalAllocated,
          unallocated_payments: totalPaid - totalAllocated
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
      }
      else if (pathname?.match(/^\/api\/companies\/\d+\/suppliers\/\d+\/payment-allocation-summary$/) && method === 'GET') {
        const pathParts = pathname.split('/');
        const companyId = parseInt(pathParts[3]);
        const supplierId = parseInt(pathParts[5]);
        
        const payments = await prisma.commission_payments.findMany({
          where: {
            company_id: companyId,
            supplier_id: supplierId
          },
          include: {
            commission_payment_items: {
              include: {
                commission_allocations: true
              }
            }
          },
          orderBy: { payment_date: 'desc' }
        });
        
        // Transform to match existing API response
        const result = payments.map(payment => {
          const allocatedAmount = payment.commission_payment_items.reduce((sum, item) => {
            const itemAllocated = item.commission_allocations.reduce((itemSum, alloc) => 
              itemSum + parseFloat(alloc.allocated_amount.toString()), 0
            );
            return sum + itemAllocated;
          }, 0);
          const totalAmount = parseFloat(payment.payment_amount.toString());
          
          return {
            payment_id: payment.id,
            payment_date: payment.payment_date,
            total_amount: totalAmount,
            reference_number: payment.payment_reference,
            status: payment.status,
            allocated_amount: allocatedAmount,
            unallocated_amount: totalAmount - allocatedAmount
          };
        });
        
        res.writeHead(200);
        res.end(JSON.stringify(result));
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