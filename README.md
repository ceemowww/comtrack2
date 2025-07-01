# ComTrack2 - Commission Tracking System

A comprehensive commission tracking system for managing supplier payments and reconciliation.

## Features

- **Multi-tenant Architecture**: Support for multiple companies/workspaces
- **Supplier Management**: Track suppliers, parts, and pricing
- **Sales Order Tracking**: Record customer orders with commission percentages
- **Commission Calculation**: Automatic commission calculation per line item
- **Payment Recording**: Track commission payments from suppliers
- **Payment Allocation**: Allocate payments to specific outstanding commission items
- **Real-time Reconciliation**: View outstanding commissions and payment status

## Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Initialize database:**
   ```bash
   npm run init-db
   ```

3. **Run migrations:**
   ```bash
   cd server && DATABASE_URL="postgresql://username@localhost:5432/comtrack" node ../migrations/migrate-commission.js
   cd server && DATABASE_URL="postgresql://username@localhost:5432/comtrack" node ../migrations/migrate-commission-status.js
   cd server && DATABASE_URL="postgresql://username@localhost:5432/comtrack" node ../migrations/migrate-commission-allocations.js
   ```

4. **Development (runs both frontend and backend):**
   ```bash
   npm run dev
   ```

5. **Production build and start:**
   ```bash
   npm run build
   npm start
   ```

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, TypeScript, PostgreSQL, Prisma ORM
- **Database:** PostgreSQL

## Project Structure

```
comtrack2/
├── client/                 # React frontend
├── server/                # Node.js backend
│   └── prisma/            # Prisma schema and migrations
├── database/              # SQL files and initialization
├── migrations/            # Database migrations
├── DATABASE_SCHEMA.md     # Complete database schema documentation
└── CLAUDE.md              # Development instructions and Prisma setup
```

## Key Features

### Commission Tracking
- Track commission percentages per sales order line item
- Automatic commission amount calculation
- View outstanding commission by supplier

### Payment Management
- Record commission payments from suppliers
- Allocate payments to specific line items
- Track payment status (unallocated, partially allocated, fully allocated)

### Supplier Portal
- Individual supplier pages at `/suppliers/:supplierId`
- View supplier parts, orders, and commission details
- Record and allocate payments

## Database Setup

1. Make sure PostgreSQL is running
2. Create the database: `createdb comtrack`
3. Update the `.env` file in the `server` directory with your database URL:
   ```
   DATABASE_URL=postgresql://username@localhost:5432/comtrack
   ```