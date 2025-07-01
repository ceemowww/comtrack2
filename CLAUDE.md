# ComTrack2 - Commission Tracking System

## Database Setup

The project uses PostgreSQL locally. Database configuration is in `/server/.env`:

```
DATABASE_URL=postgresql://cassmao@localhost:5432/comtrack
```

## Project Structure

- `/server` - Backend Node.js/TypeScript server
- `/client` - React frontend
- `/database` - Database SQL files (schema, demo data, init scripts)

## Running the Application

1. **Database**: Ensure PostgreSQL is running locally
2. **Development** (runs both client and server): `npm run dev`
3. **Production**: `npm run build && npm start`

## Commands

- `npm run dev` - Start both client (port 3000) and server (port 3001) in development mode
- `npm run build` - Build both client and server for production
- `npm start` - Start production server (serves built client)
- `npm run install:all` - Install dependencies for all packages

## Worktree Port Management

When working with multiple git worktrees, each worktree needs unique ports to avoid conflicts:

### Port Allocation Strategy
- **Main worktree**: Server on 3001, Client on 3000
- **Agent2 worktree**: Server on 3002, Client on 3003  
- **Additional worktrees**: Increment by 2 (3004/3005, 3006/3007, etc.)

### Setup for New Worktrees
1. **Create environment files**:
   ```bash
   # Root .env
   PORT=3002
   REACT_APP_PORT=3003
   
   # server/.env
   PORT=3002
   DATABASE_URL=postgresql://cassmao@localhost:5432/comtrack
   ```

2. **Update client proxy** in `client/package.json`:
   ```json
   "proxy": "http://localhost:3002"
   ```

3. **Install dependencies**:
   ```bash
   npm install                                    # Root dependencies
   cd /path/to/worktree/server && npm install    # Server dependencies  
   cd /path/to/worktree/client && npm install    # Client dependencies
   ```
   
   **Note**: Use full directory paths when changing directories. Relative paths like `cd client` may not work in all contexts.

### Environment Variables
- `PORT` - Server port (3002 for agent2)
- `REACT_APP_PORT` - Client port (3003 for agent2) 
- `DATABASE_URL` - Shared PostgreSQL database connection

## Commission Feature

The sales order system tracks commission percentages per line item with a comprehensive payment and allocation system:

### Commission Calculation System
The system uses a **hybrid approach** for commission calculations:

#### Frontend (Real-time Preview)
- Real-time calculation in UI as user enters values
- Shows immediate feedback for `line_total = quantity × unit_price` and `commission_amount = line_total × commission_percentage / 100`
- Frontend calculations are **preview only** - not sent to server

#### Server (Single Source of Truth)
- Server always recalculates and stores commission amounts
- Receives only base values: `quantity`, `unit_price`, `commission_percentage`
- Server calculates and stores: `line_total`, `commission_amount`, `total_commission`
- Includes validation for reasonable ranges (commission 0-100%, positive quantities, etc.)

#### Data Storage
- All calculations stored as regular database columns (not generated columns)
- Server calculation is authoritative for all stored data
- Ensures data integrity and consistent business logic

### Commission Payment Architecture
The system uses a **three-tier architecture** for flexible commission management:

1. **Payment Level** (`commission_payments`): 
   - Total payment amount, supplier, date, reference
   - Status automatically calculated from allocations
   - One payment can fund multiple commission items

2. **Payment Item Level** (`commission_payment_items`):
   - Line item breakdown of payments (invoices, adjustments, etc.)
   - Sum of items must be ≤ total payment amount
   - Enables detailed payment tracking and reporting

3. **Allocation Level** (`commission_allocations`):
   - Maps payment items to specific sales order items
   - Enforces supplier matching (payment supplier = sales order supplier)
   - Tracks exactly which commissions are paid

### Business Rules
- **Supplier Constraint**: Payments are supplier-specific; allocations only allowed to same supplier's sales order items
- **Amount Validation**: Line item amounts cannot exceed payment total
- **Status Management**: Payment status auto-updates based on allocation coverage
- **Data Integrity**: All monetary fields use Prisma.Decimal for precision


## Prisma Setup & Usage Guide

The project uses Prisma ORM exclusively for all database operations.

### File Structure
- `/server/prisma/schema.prisma` - Database schema definition
- `/server/src/db.ts` - Exports `prisma` client
- `/server/src/prisma-examples.ts` - Example Prisma queries for reference
- `/server/src/database-types.ts` - Manual TypeScript types (supplementary to Prisma types)
- `/DATABASE_SCHEMA.md` - Complete schema documentation

### Prisma Commands (run from `/server` directory)
- `npx prisma db pull` - Pull/introspect database schema into prisma/schema.prisma
- `npx prisma generate` - Generate Prisma Client from schema
- `npx prisma studio` - Open Prisma Studio GUI to browse/edit data
- `npx prisma migrate dev` - Create and apply migrations (for schema changes)

### Current Status
✅ **MIGRATION COMPLETE**: All endpoints now use Prisma exclusively.

The codebase has been fully migrated from raw SQL to Prisma:
- Removed `pg` dependency
- All API endpoints converted to Prisma queries
- Full type safety with auto-generated TypeScript types
- Consistent error handling with Prisma error codes

### Prisma Best Practices & Operating Protocol

#### 1. Query Patterns
- **Simple queries**: Use `findMany`, `findFirst`, `create`, `update`, `delete`
- **Relations**: Use `include` for loading related data
- **Filtering**: Use `where` with proper TypeScript types
- **Ordering**: Use `orderBy` for consistent sorting
- **Transactions**: Use `prisma.$transaction()` for multi-operation atomicity

#### 2. Error Handling
- **Known errors**: Catch `Prisma.PrismaClientKnownRequestError` 
- **Common codes**:
  - `P2002`: Unique constraint violation
  - `P2025`: Record not found
- **Unknown errors**: Let them bubble up for logging

#### 3. Type Safety
- **Imports**: Always import `{ Prisma }` for types and error handling
- **Decimals**: Use `new Prisma.Decimal()` for monetary values
- **Dates**: Use `new Date()` for timestamp fields
- **Nullable fields**: Use `|| null` for optional string fields

#### 4. Performance
- **Select only needed fields**: Use `select` instead of `include` when possible
- **Limit data**: Use `take` and `skip` for pagination
- **Indexes**: Leverage database indexes defined in schema
- **Batch operations**: Use `createMany`, `updateMany` when appropriate

### Common Query Examples
```typescript
import { prisma } from './db';
import { Prisma } from './generated/prisma';

// 1. Basic CRUD Operations
const companies = await prisma.companies.findMany({
  orderBy: { name: 'asc' }
});

const customer = await prisma.customers.create({
  data: {
    company_id: companyId,
    name: 'New Customer',
    email: email || null,  // Handle nullable fields
    phone: phone || null
  }
});

// 2. Error Handling Pattern
try {
  const customer = await prisma.customers.update({
    where: { id: customerId, company_id: companyId },
    data: { name: 'Updated Name' }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return { error: 'Customer not found' };
  }
  throw error;  // Re-throw unknown errors
}

// 3. Complex Relations
const ordersWithDetails = await prisma.sales_orders.findMany({
  where: { company_id: companyId },
  include: {
    customers: true,
    sales_order_items: {
      include: { parts: true, suppliers: true }
    }
  },
  orderBy: [{ order_date: 'desc' }, { created_at: 'desc' }]
});

// 4. Transactions for Atomicity
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.sales_orders.create({
    data: { /* order data */ }
  });
  
  for (const item of items) {
    await tx.sales_order_items.create({
      data: {
        sales_order_id: order.id,
        unit_price: new Prisma.Decimal(item.unit_price),
        // ... other fields
      }
    });
  }
  
  return order;
});

// 5. Financial Data with Decimals
const payment = await prisma.commission_payments.create({
  data: {
    company_id: companyId,
    payment_amount: new Prisma.Decimal(totalAmount),  // Always use Decimal for money
    payment_date: new Date(paymentDate)  // Always use Date for timestamps
  }
});

// 6. Commission Payment Line Items Pattern
const result = await prisma.$transaction(async (tx) => {
  // Create payment header
  const payment = await tx.commission_payments.create({
    data: {
      company_id: companyId,
      supplier_id,
      payment_date: new Date(payment_date),
      payment_amount: new Prisma.Decimal(total_amount),
      payment_reference: reference_number || null,
      status: 'unallocated'
    }
  });

  // Create default payment item (can be split into multiple items later)
  const paymentItem = await tx.commission_payment_items.create({
    data: {
      company_id: companyId,
      commission_payment_id: payment.id,
      amount: new Prisma.Decimal(total_amount),
      description: 'Payment item'
    }
  });

  return { ...payment, items: [paymentItem] };
});

// 7. Commission Allocations with Supplier Validation
const allocation = await prisma.$transaction(async (tx) => {
  // Verify payment item exists and get supplier info
  const paymentItem = await tx.commission_payment_items.findFirst({
    where: { id: commission_payment_item_id, company_id: companyId },
    include: { commission_payments: { include: { suppliers: true } } }
  });
  
  // Verify sales order item belongs to same supplier
  const salesOrderItem = await tx.sales_order_items.findFirst({
    where: { 
      id: sales_order_item_id, 
      company_id: companyId,
      supplier_id: paymentItem.commission_payments.supplier_id  // Enforce supplier match
    }
  });
  
  // Create allocation
  return await tx.commission_allocations.create({
    data: {
      company_id: companyId,
      commission_payment_item_id,
      sales_order_item_id,
      allocated_amount: new Prisma.Decimal(allocated_amount)
    }
  });
});
```

### CRITICAL: Schema Change Checklist
**ALWAYS follow this checklist when making database schema changes:**

1. **✅ Update Database Schema**
   - Make SQL changes via migrations or direct SQL
   - Test changes work correctly

2. **✅ Update Prisma Schema**
   ```bash
   cd server && npx prisma db pull
   ```

3. **✅ Regenerate Prisma Client**
   ```bash
   cd server && npx prisma generate
   ```

4. **✅ Update Documentation**
   - Prisma schema is the source of truth for database structure
   - Add business rules and constraints to this CLAUDE.md file
   - Update API documentation if endpoints change

5. **✅ Update TypeScript Types**
   - Update `/server/src/database-types.ts` if using raw SQL
   - Remove any obsolete interfaces

6. **✅ Verify Compilation**
   ```bash
   cd server && npm run build
   ```

7. **✅ Update Examples (if needed)**
   - Add new query patterns to `/server/src/prisma-examples.ts`
   - Update this CLAUDE.md file if new patterns emerge

**Example workflow for removing a table:**
```bash
# 1. Remove table via SQL or update schema
# 2. Pull changes
cd server && npx prisma db pull
# 3. Regenerate client  
cd server && npx prisma generate
# 4. Update docs, add business rules to CLAUDE.md if needed
# 5. Remove types from database-types.ts
# 6. Verify build
cd server && npm run build
```

### Schema Migration Best Practices

**Lessons Learned from Commission Payment Items Migration:**

1. **Full Migration Strategy**: When changing core relationships, commit to full migration rather than maintaining backward compatibility
   - Avoids complexity and technical debt
   - Ensures data consistency
   - Simpler to maintain long-term

2. **Transaction-Based Changes**: Use database transactions for complex multi-table operations
   - Payment + payment item creation in single transaction
   - Allocation + status update atomically
   - Prevents partial state corruption

3. **Null Safety in TypeScript**: Always add null checks when working with Prisma relations
   ```typescript
   // Good: Safe access with fallback
   const total = payment?.commission_payment_items.reduce(...) || new Prisma.Decimal(0);
   
   // Bad: Assumes payment exists
   const total = payment.commission_payment_items.reduce(...);
   ```

4. **API Field Mapping**: Maintain consistent field names in API responses while allowing DB flexibility
   ```typescript
   // Transform DB fields to expected API format
   total_amount: payment.payment_amount,
   reference_number: payment.payment_reference
   ```

5. **Component Decoupling**: Remove deprecated functionality from components rather than patch incompatibilities
   - Cleaner codebase
   - Avoids TypeScript errors
   - Forces proper new implementation

## Development Notes

- All database operations now use Prisma exclusively
- Use Prisma Migrate for schema changes (`npx prisma migrate dev`)
- Demo data includes sample commission percentages (5-8% varying by supplier)
- Client has proxy configuration to forward `/api/*` requests to `http://localhost:3001`
- If you get "Failed to load companies" error, ensure both client and server are running and restart `npm run dev`