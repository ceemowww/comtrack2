export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  company_id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: number;
  company_id: number;
  supplier_id: number;
  sku: string;
  name: string;
  description?: string;
  price?: number;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
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
  part_name?: string;
  sku?: string;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderWithItems extends SalesOrder {
  items: SalesOrderItem[];
}

export interface CreateSalesOrderData {
  customer_id: number;
  po_number: string;
  order_date: string;
  status?: string;
  notes?: string;
  items: {
    part_id: number;
    supplier_id: number;
    quantity: number;
    unit_price: number;
    commission_percentage?: number;
  }[];
}

export interface CommissionPaymentItem {
  id: number;
  company_id: number;
  commission_payment_id: number;
  amount: number;
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommissionPaymentLineItem {
  amount: number;
  description: string;
  notes?: string;
}

export interface CreateCommissionPaymentData {
  supplier_id: number;
  payment_date: string;
  line_items: CreateCommissionPaymentLineItem[];
  reference_number?: string;
  notes?: string;
}

export interface CommissionPayment {
  id: number;
  company_id: number;
  supplier_id: number;
  supplier_name?: string;  // Added via JOIN in API responses
  payment_date: string;
  total_amount: number;  // API returns this mapped from payment_amount
  reference_number?: string;  // API returns this mapped from payment_reference
  notes?: string;
  status: 'unallocated' | 'partially_allocated' | 'fully_allocated';
  created_at: string;
  updated_at: string;
}

export interface CommissionPaymentWithItems extends CommissionPayment {
  items: CommissionPaymentItem[];
  total_line_items: number;  // Sum of all line item amounts
  remaining_amount: number;  // total_amount - total_line_items
}

export interface CommissionAllocation {
  id: number;
  company_id: number;
  commission_payment_item_id: number;  // Updated to reference payment items
  sales_order_item_id: number;
  allocated_amount: number;
  allocation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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

export interface SupplierCommissionSummary {
  supplier_id: number;
  total_commission_generated: number;
  total_commission_paid: number;
  total_commission_allocated: number;
  commission_outstanding: number;
  unallocated_payments: number;
}