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