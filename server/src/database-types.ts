/**
 * Database Schema Types
 * 
 * This file provides TypeScript interfaces that match the database schema.
 * These types can be used throughout the application for type safety.
 * 
 * Note: With Prisma, you can also import generated types from '@prisma/client'
 * but these manual types are useful for documentation and when working with raw SQL.
 */

export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Customer {
  id: number;
  company_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Supplier {
  id: number;
  company_id: number;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Part {
  id: number;
  company_id: number;
  supplier_id: number;
  sku: string;
  name: string;
  description?: string | null;
  price?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface SalesOrder {
  id: number;
  company_id: number;
  customer_id: number;
  po_number: string;
  order_date: Date;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  total_amount?: number;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
  total_commission?: number;
}

export interface SalesOrderItem {
  id: number;
  company_id: number;
  sales_order_id: number;
  part_id: number;
  supplier_id: number;
  quantity: number;
  unit_price: number;
  line_total?: number; // Generated column
  commission_rate?: number;
  commission_percentage?: number;
  commission_amount?: number; // Generated column
  created_at?: Date;
  updated_at?: Date;
}

export interface CommissionPayment {
  id: number;
  company_id: number;
  supplier_id: number;
  payment_date: Date;
  payment_amount: number;
  payment_reference?: string | null;
  notes?: string | null;
  status?: 'received' | 'pending' | 'cancelled';
  created_at?: Date;
  updated_at?: Date;
}

export interface CommissionAllocation {
  id: number;
  company_id: number;
  commission_payment_id: number;
  sales_order_item_id: number;
  allocated_amount: number;
  allocation_date?: Date;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}


// Joined/Extended Types for common queries

export interface SalesOrderWithItems extends SalesOrder {
  items: SalesOrderItemWithDetails[];
  customer?: Customer;
}

export interface SalesOrderItemWithDetails extends SalesOrderItem {
  part?: Part;
  supplier?: Supplier;
}

export interface CommissionPaymentWithAllocations extends CommissionPayment {
  allocations: CommissionAllocation[];
  supplier?: Supplier;
  total_allocated?: number;
  unallocated_balance?: number;
}

export interface SupplierCommissionSummary {
  supplier_id: number;
  supplier_name: string;
  total_commission: number;
  allocated_amount: number;
  unallocated_amount: number;
}