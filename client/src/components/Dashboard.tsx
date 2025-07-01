import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Company, Customer, Supplier, Part, SalesOrder, CommissionOutstanding, CommissionPayment } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Building2, Users, Truck, Mail, Phone, MapPin, User, Package, DollarSign, Plus, Edit, Trash2, FileText, Calendar, CreditCard, Receipt } from 'lucide-react';
import CustomerForm from './CustomerForm';
import SupplierForm from './SupplierForm';
import PartForm from './PartForm';
import SalesOrderCreate from './SalesOrderCreate';
import SalesOrderDetail from './SalesOrderDetail';
import CommissionPaymentForm from './CommissionPaymentForm';
import CommissionPaymentDetail from './CommissionPaymentDetail';

interface DashboardProps {
  company: Company;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ company, onLogout }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [commissionOutstanding, setCommissionOutstanding] = useState<CommissionOutstanding[]>([]);
  const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>([]);
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers' | 'parts' | 'sales-orders' | 'commission-payments'>('sales-orders');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showCreateSalesOrder, setShowCreateSalesOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [showCreateCommissionPayment, setShowCreateCommissionPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Customer form state
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Supplier form state
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);

  // Part form state
  const [partFormOpen, setPartFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [partLoading, setPartLoading] = useState(false);


  // Commission payment form state
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, suppliersData, partsData, salesOrdersData, commissionData, paymentsData] = await Promise.all([
          api.getCustomers(company.id),
          api.getSuppliers(company.id),
          api.getParts(company.id),
          api.getSalesOrders(company.id),
          api.getCommissionOutstanding(company.id),
          api.getCommissionPayments(company.id)
        ]);
        setCustomers(customersData);
        setSuppliers(suppliersData);
        setParts(partsData);
        setSalesOrders(salesOrdersData);
        setCommissionOutstanding(commissionData);
        setCommissionPayments(paymentsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [company.id]);

  // Customer CRUD handlers
  const handleCreateCustomer = async (customerData: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    setCustomerLoading(true);
    try {
      const newCustomer = await api.createCustomer(company.id, customerData);
      setCustomers(prev => [...prev, newCustomer]);
      setCustomerFormOpen(false);
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Failed to create customer. Please try again.');
      throw error;
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleUpdateCustomer = async (customerData: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!editingCustomer) return;
    
    setCustomerLoading(true);
    try {
      const updatedCustomer = await api.updateCustomer(company.id, editingCustomer.id, customerData);
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
      setCustomerFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('Failed to update customer. Please try again.');
      throw error;
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await api.deleteCustomer(company.id, customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerFormOpen(true);
  };

  const openCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerFormOpen(true);
  };

  // Supplier CRUD handlers
  const handleCreateSupplier = async (supplierData: Omit<Supplier, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    setSupplierLoading(true);
    try {
      const newSupplier = await api.createSupplier(company.id, supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
      setSupplierFormOpen(false);
    } catch (error) {
      console.error('Failed to create supplier:', error);
      alert('Failed to create supplier. Please try again.');
      throw error;
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleUpdateSupplier = async (supplierData: Omit<Supplier, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!editingSupplier) return;
    
    setSupplierLoading(true);
    try {
      const updatedSupplier = await api.updateSupplier(company.id, editingSupplier.id, supplierData);
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
      setSupplierFormOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      console.error('Failed to update supplier:', error);
      alert('Failed to update supplier. Please try again.');
      throw error;
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      await api.deleteSupplier(company.id, supplierId);
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  };

  const openEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierFormOpen(true);
  };

  const openCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormOpen(true);
  };

  // Part CRUD handlers
  const handleCreatePart = async (partData: Omit<Part, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    setPartLoading(true);
    try {
      const newPart = await api.createPart(company.id, partData);
      setParts(prev => [...prev, newPart]);
      setPartFormOpen(false);
    } catch (error) {
      console.error('Failed to create part:', error);
      alert('Failed to create part. Please try again.');
      throw error;
    } finally {
      setPartLoading(false);
    }
  };

  const handleUpdatePart = async (partData: Omit<Part, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!editingPart) return;
    
    setPartLoading(true);
    try {
      const updatedPart = await api.updatePart(company.id, editingPart.id, partData);
      setParts(prev => prev.map(p => p.id === editingPart.id ? updatedPart : p));
      setPartFormOpen(false);
      setEditingPart(null);
    } catch (error) {
      console.error('Failed to update part:', error);
      alert('Failed to update part. Please try again.');
      throw error;
    } finally {
      setPartLoading(false);
    }
  };

  const handleDeletePart = async (partId: number) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
    
    try {
      await api.deletePart(company.id, partId);
      setParts(prev => prev.filter(p => p.id !== partId));
    } catch (error) {
      console.error('Failed to delete part:', error);
    }
  };

  const openEditPart = (part: Part) => {
    setEditingPart(part);
    setPartFormOpen(true);
  };

  const openCreatePart = () => {
    setEditingPart(null);
    setPartFormOpen(true);
  };

  // Sales Order handlers
  const handleSalesOrderSuccess = async () => {
    try {
      const salesOrdersData = await api.getSalesOrders(company.id);
      setSalesOrders(salesOrdersData);
      setShowCreateSalesOrder(false);
      setActiveTab('sales-orders');
    } catch (error) {
      console.error('Failed to refresh sales orders:', error);
    }
  };

  const handleSalesOrderDetailBack = async () => {
    // Refresh sales orders data when returning from detail page
    try {
      const salesOrdersData = await api.getSalesOrders(company.id);
      setSalesOrders(salesOrdersData);
    } catch (error) {
      console.error('Failed to refresh sales orders:', error);
    }
    setSelectedOrderId(null);
  };

  const handleDeleteSalesOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this sales order?')) return;
    
    try {
      await api.deleteSalesOrder(company.id, orderId);
      setSalesOrders(prev => prev.filter(so => so.id !== orderId));
    } catch (error) {
      console.error('Failed to delete sales order:', error);
    }
  };


  // Commission Payment handlers
  const handleCommissionPaymentSuccess = async () => {
    try {
      const paymentsData = await api.getCommissionPayments(company.id);
      setCommissionPayments(paymentsData);
      setShowCreateCommissionPayment(false);
      setActiveTab('commission-payments');
    } catch (error) {
      console.error('Failed to refresh commission payments:', error);
    }
  };

  const handleCreateCommissionPayment = async (paymentData: Omit<CommissionPayment, 'id' | 'company_id' | 'status' | 'created_at' | 'updated_at'>) => {
    setPaymentLoading(true);
    try {
      const newPayment = await api.createCommissionPayment(company.id, paymentData);
      setCommissionPayments(prev => [newPayment, ...prev]);
      setPaymentFormOpen(false);
    } catch (error) {
      console.error('Failed to create commission payment:', error);
      alert('Failed to create commission payment. Please try again.');
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Show create sales order page
  if (showCreateSalesOrder) {
    return (
      <SalesOrderCreate
        companyId={company.id}
        onBack={() => setShowCreateSalesOrder(false)}
        onSuccess={handleSalesOrderSuccess}
      />
    );
  }

  // Show sales order detail page
  if (selectedOrderId) {
    return (
      <SalesOrderDetail
        companyId={company.id}
        orderId={selectedOrderId}
        onBack={handleSalesOrderDetailBack}
      />
    );
  }

  // Show commission payment detail page
  if (selectedPaymentId) {
    return (
      <CommissionPaymentDetail
        companyId={company.id}
        paymentId={selectedPaymentId}
        onBack={() => setSelectedPaymentId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button 
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sales-orders' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('sales-orders')}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Sales Orders ({salesOrders.length})
            </button>
            <button 
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'commission-payments' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('commission-payments')}
            >
              <Receipt className="inline h-4 w-4 mr-2" />
              Commission Payments ({commissionPayments.length})
            </button>
            <button 
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'customers' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('customers')}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Customers ({customers.length})
            </button>
            <button 
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'suppliers' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('suppliers')}
            >
              <Truck className="inline h-4 w-4 mr-2" />
              Suppliers ({suppliers.length})
            </button>
            <button 
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'parts' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('parts')}
            >
              <Package className="inline h-4 w-4 mr-2" />
              Parts ({parts.length})
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'sales-orders' ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Orders</h2>
                <p className="text-gray-600">Customer purchase orders with commission tracking</p>
              </div>
              <Button onClick={() => setShowCreateSalesOrder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Sales Order
              </Button>
            </div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">PO Number</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Total Sales</div>
                  <div className="col-span-2">Commission</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {salesOrders.map(order => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-blue-100 text-blue-800',
                    shipped: 'bg-purple-100 text-purple-800',
                    delivered: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800'
                  };
                  
                  return (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                            <button 
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              {order.po_number}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{order.customer_name}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {new Date(order.order_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {typeof order.total_amount === 'string' 
                                ? parseFloat(order.total_amount).toFixed(2) 
                                : order.total_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {order.total_commission 
                                ? (typeof order.total_commission === 'string' 
                                   ? parseFloat(order.total_commission).toFixed(2)
                                   : order.total_commission.toFixed(2))
                                : '0.00'}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSalesOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'commission-payments' ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Commission Payments</h2>
                <p className="text-gray-600">Track and manage commission payments to suppliers</p>
              </div>
              <Button onClick={() => setPaymentFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Reference</div>
                  <div className="col-span-2">Supplier</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Notes</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {(commissionPayments || []).map(payment => {
                  const statusColors = {
                    received: 'bg-blue-100 text-blue-800',
                    partially_allocated: 'bg-yellow-100 text-yellow-800',
                    fully_allocated: 'bg-green-100 text-green-800'
                  };
                  
                  return (
                    <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Receipt className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                            <button 
                              className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                              onClick={() => setSelectedPaymentId(payment.id)}
                            >
                              {payment.reference_number || `Payment #${payment.id}`}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{payment.supplier_name || 'Unknown Supplier'}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {payment.payment_date 
                                ? new Date(payment.payment_date).toLocaleDateString()
                                : 'No date'}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[(payment.status || 'unallocated') as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {(payment.status || 'unallocated').replace('_', ' ')}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {payment.total_amount != null 
                                ? (typeof payment.total_amount === 'string' 
                                   ? parseFloat(payment.total_amount).toFixed(2) 
                                   : payment.total_amount.toFixed(2))
                                : '0.00'}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-500 truncate" title={payment.notes || ''}>
                            {payment.notes || '-'}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPaymentId(payment.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Customers</h2>
                <p className="text-gray-600">Manage your business customers</p>
              </div>
              <Button onClick={openCreateCustomer}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customers.map(customer => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                        {customer.name}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : activeTab === 'suppliers' ? (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Suppliers</h2>
                <p className="text-gray-600">Manage your business suppliers</p>
              </div>
              <Button onClick={openCreateSupplier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suppliers.map(supplier => {
                const supplierCommission = commissionOutstanding.find(c => c.supplier_id === supplier.id);
                return (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 mr-2 text-green-600" />
                          {supplier.name}
                        </div>
                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSupplier(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {supplier.contact_person && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            {supplier.contact_person}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{supplier.address}</span>
                          </div>
                        )}
                        {supplierCommission && Number(supplierCommission.outstanding_amount) > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Commission Outstanding:</span>
                              <span className="font-semibold text-red-600">
                                ${Number(supplierCommission.outstanding_amount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Parts</h2>
                <p className="text-gray-600">Parts catalog from your suppliers</p>
              </div>
              <Button onClick={openCreatePart}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Part Name</div>
                  <div className="col-span-2">SKU</div>
                  <div className="col-span-3">Supplier</div>
                  <div className="col-span-1">Price</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {parts.map(part => {
                  const supplier = suppliers.find(s => s.id === part.supplier_id);
                  return (
                    <div key={part.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900">{part.name}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="font-mono text-sm text-gray-600">{part.sku}</span>
                        </div>
                        <div className="col-span-3">
                          {supplier && (
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{supplier.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="col-span-1">
                          {part.price && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {typeof part.price === 'string' ? parseFloat(part.price).toFixed(2) : part.price.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          {part.description && (
                            <p className="text-sm text-gray-500 truncate" title={part.description}>
                              {part.description}
                            </p>
                          )}
                        </div>
                        <div className="col-span-1">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPart(part)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePart(part.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Customer Form Modal */}
      <CustomerForm
        open={customerFormOpen}
        onOpenChange={setCustomerFormOpen}
        customer={editingCustomer}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        loading={customerLoading}
      />

      {/* Supplier Form Modal */}
      <SupplierForm
        open={supplierFormOpen}
        onOpenChange={setSupplierFormOpen}
        supplier={editingSupplier}
        onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier}
        loading={supplierLoading}
      />

      {/* Part Form Modal */}
      <PartForm
        open={partFormOpen}
        onOpenChange={setPartFormOpen}
        part={editingPart}
        suppliers={suppliers}
        onSubmit={editingPart ? handleUpdatePart : handleCreatePart}
        loading={partLoading}
      />

      {/* Commission Payment Form Modal */}
      <CommissionPaymentForm
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        suppliers={suppliers}
        onSubmit={handleCreateCommissionPayment}
        loading={paymentLoading}
      />
    </div>
  );
};

export default Dashboard;