import axios from 'axios';
import { Company, Customer, Supplier, Part } from './types';

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
  }
};