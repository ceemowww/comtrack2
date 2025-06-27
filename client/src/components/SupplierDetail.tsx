import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Supplier, Part, SalesOrder, CommissionOutstanding, CommissionOutstandingDetail, CommissionPayment } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Package, FileText, DollarSign, Calendar, User, CreditCard, Plus } from 'lucide-react';
import CommissionPaymentForm from './CommissionPaymentForm';
import CommissionAllocationTest from './CommissionAllocationTest';

interface SupplierDetailProps {
  supplier: Supplier;
  companyId: number;
  onBack: () => void;
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplier, companyId, onBack }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [commissionDetails, setCommissionDetails] = useState<CommissionOutstandingDetail[]>([]);
  const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'parts' | 'orders' | 'commission' | 'payments'>('overview');
  
  // Payment form state
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [allocationFormOpen, setAllocationFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CommissionPayment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        const [allParts, allOrders, commissionData, paymentsData] = await Promise.all([
          api.getParts(companyId),
          api.getSalesOrders(companyId),
          api.getCommissionOutstandingDetails(companyId, supplier.id),
          api.getCommissionPayments(companyId)
        ]);
        
        // Filter parts for this supplier
        const supplierParts = allParts.filter(part => part.supplier_id === supplier.id);
        setParts(supplierParts);
        
        // Filter sales orders that contain items from this supplier
        const supplierOrderIds = new Set(commissionData.map(detail => detail.sales_order_id));
        const supplierOrders = allOrders.filter(order => supplierOrderIds.has(order.id));
        setSalesOrders(supplierOrders);
        
        setCommissionDetails(commissionData);
        
        // Filter payments for this supplier
        const supplierPayments = paymentsData.filter(payment => payment.supplier_id === supplier.id);
        setCommissionPayments(supplierPayments);
      } catch (err) {
        console.error('Failed to fetch supplier data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [companyId, supplier.id]);

  const totalCommissionOutstanding = commissionDetails.reduce((sum, detail) => sum + Number(detail.outstanding_amount), 0);
  const totalCommissionEarned = commissionDetails.reduce((sum, detail) => sum + Number(detail.commission_amount), 0);
  const totalCommissionPaid = commissionDetails.reduce((sum, detail) => sum + Number(detail.paid_amount), 0);

  // Payment handlers
  const handleCreatePayment = async (paymentData: Omit<CommissionPayment, 'id' | 'company_id' | 'status' | 'created_at' | 'updated_at'>) => {
    setPaymentLoading(true);
    try {
      const newPayment = await api.createCommissionPayment(companyId, paymentData);
      setCommissionPayments(prev => [newPayment, ...prev]);
      setPaymentFormOpen(false);
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAllocatePayment = async (allocation: {commission_payment_id: number, sales_order_item_id: number, allocated_amount: number, notes?: string}) => {
    setPaymentLoading(true);
    try {
      await api.createCommissionAllocation(companyId, allocation);
      
      // Refresh data to show updated allocations
      const [updatedCommissionData, updatedPaymentsData] = await Promise.all([
        api.getCommissionOutstandingDetails(companyId, supplier.id),
        api.getCommissionPayments(companyId)
      ]);
      
      setCommissionDetails(updatedCommissionData);
      const supplierPayments = updatedPaymentsData.filter(payment => payment.supplier_id === supplier.id);
      setCommissionPayments(supplierPayments);
      
      // Don't close the modal - let user allocate more if needed
    } catch (error) {
      console.error('Failed to allocate payment:', error);
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  const openAllocationForm = (payment: CommissionPayment) => {
    setSelectedPayment(payment);
    setAllocationFormOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading supplier details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
            <p className="text-gray-600">Supplier Details</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'parts', label: `Parts (${parts.length})`, icon: Package },
            { id: 'orders', label: `Orders (${salesOrders.length})`, icon: FileText },
            { id: 'commission', label: 'Commission', icon: DollarSign },
            { id: 'payments', label: `Payments (${commissionPayments.length})`, icon: CreditCard }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveSection(id as any)}
            >
              <Icon className="inline h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.contact_person && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="text-gray-900">{supplier.contact_person}</p>
                </div>
              )}
              {supplier.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{supplier.email}</p>
                </div>
              )}
              {supplier.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{supplier.phone}</p>
                </div>
              )}
              {supplier.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{supplier.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Commission Earned</label>
                <p className="text-2xl font-bold text-gray-900">${totalCommissionEarned.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Commission Paid</label>
                <p className="text-lg font-semibold text-green-600">${totalCommissionPaid.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Outstanding Commission</label>
                <p className="text-lg font-semibold text-red-600">${totalCommissionOutstanding.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'parts' && (
        <Card>
          <CardHeader>
            <CardTitle>Parts from {supplier.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parts.map(part => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{part.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {part.price ? `$${Number(part.price).toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No parts found for this supplier
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Orders Containing {supplier.name} Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.po_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No orders found for this supplier
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'commission' && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionDetails.map(detail => (
                    <tr key={detail.sales_order_item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{detail.po_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{detail.part_name}</div>
                        <div className="text-xs text-gray-500">{detail.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(detail.commission_percentage)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(detail.commission_amount).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${Number(detail.paid_amount).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        ${Number(detail.outstanding_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {commissionDetails.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No commission details found for this supplier
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Commission Payments
              <Button onClick={() => setPaymentFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${Number(payment.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'fully_allocated' ? 'bg-green-100 text-green-800' :
                          payment.status === 'partially_allocated' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAllocationForm(payment)}
                          disabled={commissionDetails.length === 0}
                        >
                          {payment.status === 'unallocated' ? 'Allocate' : 'Re-allocate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {commissionPayments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No commission payments recorded for this supplier</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setPaymentFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Payment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Form Modal */}
      <CommissionPaymentForm
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        suppliers={[supplier]} // Only show current supplier
        onSubmit={handleCreatePayment}
        loading={paymentLoading}
      />

      {/* Payment Allocation Modal */}
      {selectedPayment && (
        <CommissionAllocationTest
          open={allocationFormOpen}
          onOpenChange={setAllocationFormOpen}
          payment={selectedPayment}
          outstandingItems={commissionDetails}
          onSubmit={handleAllocatePayment}
          loading={paymentLoading}
        />
      )}
    </div>
  );
};

export default SupplierDetail;