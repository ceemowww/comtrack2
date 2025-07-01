import axios from 'axios';
import { Company, Customer, Supplier, Part, SalesOrder, SalesOrderWithItems, CreateSalesOrderData, 
         CommissionOutstanding, CommissionOutstandingDetail, CommissionPayment, CommissionPaymentWithItems, 
         CommissionPaymentItem, CommissionAllocation, SupplierCommissionSummary, CreateCommissionPaymentData } from './types';

const API_BASE = '/api';

export const api = {
  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await axios.get(`${API_BASE}/companies`);
    return response.data;
  },

  // Customers
  getCustomers: async (companyId: number): Promise<Customer[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/customers`);
    return response.data;
  },

  createCustomer: async (companyId: number, customer: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/customers`, customer);
    return response.data;
  },

  updateCustomer: async (companyId: number, customerId: number, customer: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const response = await axios.put(`${API_BASE}/companies/${companyId}/customers/${customerId}`, customer);
    return response.data;
  },

  deleteCustomer: async (companyId: number, customerId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/companies/${companyId}/customers/${customerId}`);
  },

  // Suppliers
  getSuppliers: async (companyId: number): Promise<Supplier[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/suppliers`);
    return response.data;
  },

  createSupplier: async (companyId: number, supplier: Omit<Supplier, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/suppliers`, supplier);
    return response.data;
  },

  updateSupplier: async (companyId: number, supplierId: number, supplier: Omit<Supplier, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
    const response = await axios.put(`${API_BASE}/companies/${companyId}/suppliers/${supplierId}`, supplier);
    return response.data;
  },

  deleteSupplier: async (companyId: number, supplierId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/companies/${companyId}/suppliers/${supplierId}`);
  },

  // Parts
  getParts: async (companyId: number): Promise<Part[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/parts`);
    return response.data;
  },

  createPart: async (companyId: number, part: Omit<Part, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<Part> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/parts`, part);
    return response.data;
  },

  updatePart: async (companyId: number, partId: number, part: Omit<Part, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<Part> => {
    const response = await axios.put(`${API_BASE}/companies/${companyId}/parts/${partId}`, part);
    return response.data;
  },

  deletePart: async (companyId: number, partId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/companies/${companyId}/parts/${partId}`);
  },

  // Sales Orders
  getSalesOrders: async (companyId: number, includeItems?: boolean): Promise<SalesOrder[]> => {
    const params = includeItems ? '?include_items=true' : '';
    const response = await axios.get(`${API_BASE}/companies/${companyId}/sales-orders${params}`);
    return response.data;
  },

  getSalesOrdersWithItems: async (companyId: number): Promise<SalesOrderWithItems[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/sales-orders?include_items=true`);
    return response.data;
  },

  getSalesOrder: async (companyId: number, orderId: number): Promise<SalesOrderWithItems> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/sales-orders/${orderId}`);
    return response.data;
  },

  createSalesOrder: async (companyId: number, orderData: CreateSalesOrderData): Promise<SalesOrder> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/sales-orders`, orderData);
    return response.data;
  },

  deleteSalesOrder: async (companyId: number, orderId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/companies/${companyId}/sales-orders/${orderId}`);
  },

  // Commission Outstanding
  getCommissionOutstanding: async (companyId: number): Promise<CommissionOutstanding[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/commission-outstanding`);
    return response.data;
  },

  getCommissionOutstandingDetails: async (companyId: number, supplierId: number): Promise<CommissionOutstandingDetail[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/suppliers/${supplierId}/commission-outstanding/details`);
    return response.data;
  },

  // Commission Payments
  getCommissionPayments: async (companyId: number): Promise<CommissionPayment[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/commission-payments`);
    return response.data;
  },

  createCommissionPayment: async (companyId: number, payment: CreateCommissionPaymentData): Promise<CommissionPayment> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/commission-payments`, payment);
    return response.data;
  },

  updateCommissionPayment: async (companyId: number, paymentId: number, payment: { payment_date: string; reference_number?: string; notes?: string }): Promise<CommissionPayment> => {
    const response = await axios.put(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}`, payment);
    return response.data;
  },

  updateCommissionPaymentItems: async (companyId: number, paymentId: number, lineItems: { amount: number; description: string; notes?: string }[]): Promise<{ payment: CommissionPayment; items: CommissionPaymentItem[] }> => {
    const response = await axios.put(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/items/bulk-update`, { line_items: lineItems });
    return response.data;
  },

  // Commission Payment Items
  getCommissionPaymentItems: async (companyId: number, paymentId: number): Promise<CommissionPaymentItem[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/items`);
    return response.data;
  },

  createCommissionPaymentItem: async (companyId: number, paymentId: number, item: Omit<CommissionPaymentItem, 'id' | 'company_id' | 'commission_payment_id' | 'created_at' | 'updated_at'>): Promise<CommissionPaymentItem> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/items`, item);
    return response.data;
  },

  updateCommissionPaymentItem: async (companyId: number, paymentId: number, itemId: number, item: Omit<CommissionPaymentItem, 'id' | 'company_id' | 'commission_payment_id' | 'created_at' | 'updated_at'>): Promise<CommissionPaymentItem> => {
    const response = await axios.put(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/items/${itemId}`, item);
    return response.data;
  },

  deleteCommissionPaymentItem: async (companyId: number, paymentId: number, itemId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/items/${itemId}`);
  },

  createCommissionAllocation: async (companyId: number, allocation: {commission_payment_item_id: number, sales_order_item_id: number, allocated_amount: number, notes?: string}): Promise<CommissionAllocation> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/commission-allocations`, allocation);
    return response.data;
  },

  getCommissionPaymentAllocations: async (companyId: number, paymentId: number): Promise<CommissionAllocation[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/allocations`);
    return response.data;
  },

  getCommissionPaymentItemAllocations: async (companyId: number, paymentItemId: number): Promise<CommissionAllocation[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/commission-payment-items/${paymentItemId}/allocations`);
    return response.data;
  },

  getPaymentAllocationSummary: async (companyId: number, supplierId: number): Promise<any[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/suppliers/${supplierId}/payment-allocation-summary`);
    return response.data;
  },

  getSupplierCommissionSummary: async (companyId: number, supplierId: number): Promise<SupplierCommissionSummary> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/suppliers/${supplierId}/commission-summary`);
    return response.data;
  }
};

// Export individual functions for easier imports
export const getCompanies = api.getCompanies;
export const getCustomers = api.getCustomers;
export const createCustomer = api.createCustomer;
export const updateCustomer = api.updateCustomer;
export const deleteCustomer = api.deleteCustomer;
export const getSuppliers = api.getSuppliers;
export const createSupplier = api.createSupplier;
export const updateSupplier = api.updateSupplier;
export const deleteSupplier = api.deleteSupplier;
export const getParts = api.getParts;
export const createPart = api.createPart;
export const updatePart = api.updatePart;
export const deletePart = api.deletePart;
export const getSalesOrders = api.getSalesOrders;
export const getSalesOrder = api.getSalesOrder;
export const createSalesOrder = api.createSalesOrder;
export const deleteSalesOrder = api.deleteSalesOrder;
export const getCommissionOutstanding = api.getCommissionOutstanding;
export const getCommissionOutstandingDetails = api.getCommissionOutstandingDetails;
export const getCommissionPayments = api.getCommissionPayments;
export const createCommissionPayment = api.createCommissionPayment;
export const updateCommissionPayment = api.updateCommissionPayment;
export const updateCommissionPaymentItems = api.updateCommissionPaymentItems;
export const getCommissionPaymentItems = api.getCommissionPaymentItems;
export const createCommissionPaymentItem = api.createCommissionPaymentItem;
export const updateCommissionPaymentItem = api.updateCommissionPaymentItem;
export const deleteCommissionPaymentItem = api.deleteCommissionPaymentItem;
export const createCommissionAllocation = api.createCommissionAllocation;
export const getCommissionPaymentAllocations = api.getCommissionPaymentAllocations;
export const getCommissionPaymentItemAllocations = api.getCommissionPaymentItemAllocations;
export const getPaymentAllocationSummary = api.getPaymentAllocationSummary;
export const getSupplierCommissionSummary = api.getSupplierCommissionSummary;