import { prisma } from './db';

// Example: Get all companies using Prisma
export async function getCompaniesWithPrisma() {
  return await prisma.companies.findMany({
    orderBy: {
      name: 'asc'
    }
  });
}

// Example: Get customers for a company using Prisma
export async function getCustomersForCompanyWithPrisma(companyId: number) {
  return await prisma.customers.findMany({
    where: {
      company_id: companyId
    },
    orderBy: {
      name: 'asc'
    }
  });
}

// Example: Create a customer using Prisma
export async function createCustomerWithPrisma(companyId: number, data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return await prisma.customers.create({
    data: {
      company_id: companyId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null
    }
  });
}

// Example: Update a customer using Prisma
export async function updateCustomerWithPrisma(
  customerId: number,
  companyId: number,
  data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) {
  // First check if customer exists for this company
  const customer = await prisma.customers.findFirst({
    where: {
      id: customerId,
      company_id: companyId
    }
  });

  if (!customer) {
    return null;
  }

  return await prisma.customers.update({
    where: {
      id: customerId
    },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      updated_at: new Date()
    }
  });
}

// Example: Get sales orders with related data using Prisma
export async function getSalesOrdersWithPrisma(companyId: number) {
  return await prisma.sales_orders.findMany({
    where: {
      company_id: companyId
    },
    include: {
      customers: true,
      sales_order_items: {
        include: {
          parts: true,
          suppliers: true
        }
      }
    },
    orderBy: {
      order_date: 'desc'
    }
  });
}

// Example: Complex query - Get commission summary by supplier
export async function getCommissionSummaryBySupplier(companyId: number) {
  return await prisma.sales_order_items.groupBy({
    by: ['supplier_id'],
    where: {
      company_id: companyId,
      commission_amount: {
        gt: 0
      }
    },
    _sum: {
      commission_amount: true
    },
    _count: {
      id: true
    }
  });
}