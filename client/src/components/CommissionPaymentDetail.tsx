import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CommissionPayment, CommissionAllocation, Supplier } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Receipt, Truck, Calendar, DollarSign, FileText, CreditCard } from 'lucide-react';

interface CommissionPaymentDetailProps {
  companyId: number;
  paymentId: number;
  onBack: () => void;
}

const CommissionPaymentDetail: React.FC<CommissionPaymentDetailProps> = ({
  companyId,
  paymentId,
  onBack
}) => {
  const [payment, setPayment] = useState<CommissionPayment | null>(null);
  const [allocations, setAllocations] = useState<CommissionAllocation[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get payment details
        const paymentsData = await api.getCommissionPayments(companyId);
        const paymentData = paymentsData.find(p => p.id === paymentId);
        
        if (!paymentData) {
          setError('Payment not found');
          return;
        }

        setPayment(paymentData);

        // Get supplier details
        const suppliersData = await api.getSuppliers(companyId);
        const supplierData = suppliersData.find(s => s.id === paymentData.supplier_id);
        setSupplier(supplierData || null);

        // Get allocations for this payment
        const allocationsData = await api.getCommissionPaymentAllocations(companyId, paymentId);
        setAllocations(allocationsData);

      } catch (err) {
        console.error('Failed to fetch payment details:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [companyId, paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Payment not found'}</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    unallocated: 'bg-blue-100 text-blue-800',
    partially_allocated: 'bg-yellow-100 text-yellow-800',
    fully_allocated: 'bg-green-100 text-green-800'
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + Number(alloc.allocated_amount), 0);
  const remainingAmount = Number(payment.total_amount) - totalAllocated;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Receipt className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {payment.reference_number || `Payment #${payment.id}`}
                  </h1>
                  <p className="text-sm text-gray-500">Commission Payment Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-purple-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Supplier</label>
                    <div className="flex items-center mt-1">
                      <Truck className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{supplier?.name || 'Unknown Supplier'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Date</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Amount</label>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        ${Number(payment.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[payment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {payment.reference_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Number</label>
                    <p className="mt-1 text-gray-900">{payment.reference_number}</p>
                  </div>
                )}
                
                {payment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-gray-900">{payment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Allocations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                    Allocations ({allocations.length})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allocations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No allocations yet</p>
                    <p className="text-sm">This payment hasn't been allocated to any commission items.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-hidden border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sales Order Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Allocated Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allocations.map((allocation) => (
                            <tr key={allocation.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    Item #{allocation.sales_order_item_id}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    ${Number(allocation.allocated_amount).toFixed(2)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(allocation.allocation_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {allocation.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Payment:</span>
                  <span className="font-medium">${Number(payment.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Allocated:</span>
                  <span className="font-medium text-green-600">${totalAllocated.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-gray-600">Remaining:</span>
                  <span className={`font-medium ${remainingAmount > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    ${remainingAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span>#{payment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(payment.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommissionPaymentDetail;