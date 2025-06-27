import axios from 'axios';
import { Company, Customer, Supplier, Part, SalesOrder, SalesOrderWithItems, CreateSalesOrderData, 
         CommissionOutstanding, CommissionOutstandingDetail, CommissionPayment, CommissionAllocation } from './types';

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
  getSalesOrders: async (companyId: number): Promise<SalesOrder[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/sales-orders`);
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

  createCommissionPayment: async (companyId: number, payment: Omit<CommissionPayment, 'id' | 'company_id' | 'status' | 'created_at' | 'updated_at'>): Promise<CommissionPayment> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/commission-payments`, payment);
    return response.data;
  },

  createCommissionAllocation: async (companyId: number, allocation: {commission_payment_id: number, sales_order_item_id: number, allocated_amount: number, notes?: string}): Promise<CommissionAllocation> => {
    const response = await axios.post(`${API_BASE}/companies/${companyId}/commission-allocations`, allocation);
    return response.data;
  },

  getCommissionPaymentAllocations: async (companyId: number, paymentId: number): Promise<CommissionAllocation[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/commission-payments/${paymentId}/allocations`);
    return response.data;
  },

  getPaymentAllocationSummary: async (companyId: number, supplierId: number): Promise<any[]> => {
    const response = await axios.get(`${API_BASE}/companies/${companyId}/suppliers/${supplierId}/payment-allocation-summary`);
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
export const createCommissionAllocation = api.createCommissionAllocation;
export const getCommissionPaymentAllocations = api.getCommissionPaymentAllocations;
export const getPaymentAllocationSummary = api.getPaymentAllocationSummary;