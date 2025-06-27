# ComTrack2 - Commission Tracking System

## Database Setup

The project uses PostgreSQL locally. Database configuration is in `/server/.env`:

```
DATABASE_URL=postgresql://cassmao@localhost:5432/comtrack
```

## Running Database Migrations

When schema changes are made, run migrations from the project root:

```bash
# Add commission fields (if not already done)
cd server && DATABASE_URL="postgresql://cassmao@localhost:5432/comtrack" node ../migrate-commission.js

# Update demo data with commission percentages
cd server && psql "postgresql://cassmao@localhost:5432/comtrack" -c "UPDATE sales_order_items SET commission_percentage = CASE WHEN supplier_id = 1 THEN 5.0 WHEN supplier_id = 2 THEN 8.0 WHEN supplier_id = 3 THEN 6.0 ELSE 0.0 END WHERE commission_percentage = 0.0;"
```

## Project Structure

- `/server` - Backend Node.js/TypeScript server
- `/client` - React frontend
- `/schema.sql` - Database schema
- `/sales-demo-data.sql` - Demo sales order data
- `/migrate-commission.js` - Migration script for commission fields

## Running the Application

1. **Database**: Ensure PostgreSQL is running locally
2. **Development** (runs both client and server): `npm run dev`
3. **Production**: `npm run build && npm start`

## Commands

- `npm run dev` - Start both client (port 3000) and server (port 3001) in development mode
- `npm run build` - Build both client and server for production
- `npm start` - Start production server (serves built client)
- `npm run install:all` - Install dependencies for all packages

## Commission Feature

The sales order system tracks commission percentages per line item:
- Commission percentage stored per sales order item
- Commission amount calculated automatically (quantity × unit_price × commission_percentage / 100) as a generated column
- Commission reconciliation tables ready for future payment tracking

**Note:** If commission amounts show as 0.00, the commission_amount column may need to be recreated as a generated column:
```sql
ALTER TABLE sales_order_items DROP COLUMN commission_amount;
ALTER TABLE sales_order_items ADD COLUMN commission_amount DECIMAL(12,2) 
GENERATED ALWAYS AS (quantity * unit_price * commission_percentage / 100) STORED;
```

## Development Notes

- Always run migrations from `/server` directory to ensure correct environment variables
- Database schema changes require running migration scripts
- Demo data includes sample commission percentages (5-8% varying by supplier)
- Client has proxy configuration to forward `/api/*` requests to `http://localhost:3001`
- If you get "Failed to load companies" error, ensure both client and server are running and restart `npm run dev`