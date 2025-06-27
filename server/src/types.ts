export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: number;
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: number;
  company_id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Part {
  id: number;
  company_id: number;
  supplier_id: number;
  sku: string;
  name: string;
  description?: string;
  price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface SalesOrder {
  id: number;
  company_id: number;
  customer_id: number;
  po_number: string;
  order_date: string;
  status: string;
  total_amount: number;
  total_commission?: number;
  customer_name?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SalesOrderItem {
  id: number;
  company_id: number;
  sales_order_id: number;
  part_id: number;
  supplier_id: number;
  quantity: number;
  unit_price: number;
  commission_percentage: number;
  line_total: number;
  commission_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface CommissionPayment {
  id: number;
  company_id: number;
  supplier_id: number;
  payment_date: string;
  total_amount: number;  // This maps to payment_amount in DB
  reference_number?: string;  // This maps to payment_reference in DB
  notes?: string;
  status: 'unallocated' | 'partially_allocated' | 'fully_allocated';
  created_at: Date;
  updated_at: Date;
}

export interface CommissionAllocation {
  id: number;
  company_id: number;
  commission_payment_id: number;
  sales_order_item_id: number;
  allocated_amount: number;
  allocation_date: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommissionOutstanding {
  supplier_id: number;
  supplier_name: string;
  total_commission: number;
  total_paid: number;
  outstanding_amount: number;
  order_count: number;
}

export interface CommissionOutstandingDetail {
  sales_order_id: number;
  po_number: string;
  customer_name: string;
  order_date: string;
  sales_order_item_id: number;
  part_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  commission_percentage: number;
  commission_amount: number;
  paid_amount: number;
  outstanding_amount: number;
}