import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CommissionPayment, CommissionAllocation, Supplier, CommissionPaymentItem } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Receipt, Truck, Calendar, DollarSign, FileText, CreditCard, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

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
  const [paymentItems, setPaymentItems] = useState<CommissionPaymentItem[]>([]);
  const [allocations, setAllocations] = useState<CommissionAllocation[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    payment_date: '',
    reference_number: '',
    notes: ''
  });
  const [editLineItems, setEditLineItems] = useState<CommissionPaymentItem[]>([]);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

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

        // Get payment items for this payment
        const paymentItemsData = await api.getCommissionPaymentItems(companyId, paymentId);
        setPaymentItems(paymentItemsData);

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

  const enterEditMode = () => {
    if (!payment) return;
    
    setIsEditMode(true);
    setEditFormData({
      payment_date: payment.payment_date.split('T')[0], // Convert to YYYY-MM-DD format
      reference_number: payment.reference_number || '',
      notes: payment.notes || ''
    });
    setEditLineItems([...paymentItems]);
    setEditErrors({});
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({ payment_date: '', reference_number: '', notes: '' });
    setEditLineItems([]);
    setEditErrors({});
  };

  const addLineItem = () => {
    const newItem: CommissionPaymentItem = {
      id: Date.now(), // Temporary ID for new items
      company_id: payment?.company_id || 0,
      commission_payment_id: paymentId,
      amount: 0,
      description: '',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditLineItems([...editLineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    if (editLineItems.length > 1) {
      setEditLineItems(editLineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof CommissionPaymentItem, value: string | number) => {
    const updatedItems = [...editLineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditLineItems(updatedItems);
    
    // Clear errors for this field
    const errorKey = `lineItem_${index}_${field}`;
    if (editErrors[errorKey]) {
      setEditErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateEdit = () => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }

    // Validate line items
    editLineItems.forEach((item, index) => {
      if (!item.amount || item.amount <= 0) {
        newErrors[`lineItem_${index}_amount`] = 'Amount must be greater than 0';
      }
      if (!item.description || item.description.trim() === '') {
        newErrors[`lineItem_${index}_description`] = 'Description is required';
      }
    });

    const total = editLineItems.reduce((sum, item) => sum + Number(item.amount), 0);
    if (total <= 0) {
      newErrors.total = 'Total payment amount must be greater than 0';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = async () => {
    if (!validateEdit() || !payment) return;

    setEditLoading(true);
    try {
      // Update payment basic info
      const updatedPayment = await api.updateCommissionPayment(companyId, paymentId, {
        payment_date: editFormData.payment_date,
        reference_number: editFormData.reference_number || undefined,
        notes: editFormData.notes || undefined
      });

      // Update line items
      const lineItemsData = editLineItems.map(item => ({
        amount: Number(item.amount),
        description: item.description || '',
        notes: item.notes || undefined
      }));

      const { payment: updatedPaymentWithTotal, items: updatedItems } = await api.updateCommissionPaymentItems(
        companyId, 
        paymentId, 
        lineItemsData
      );

      // Update local state with the new data
      setPayment(prev => prev ? {
        ...prev,
        payment_date: updatedPayment.payment_date,
        reference_number: (updatedPayment as any).payment_reference,
        notes: updatedPayment.notes,
        updated_at: updatedPayment.updated_at,
        total_amount: (updatedPaymentWithTotal as any).payment_amount
      } : null);
      
      setPaymentItems(updatedItems);
      setIsEditMode(false);
      
      // Show success message
      alert('Payment updated successfully!');
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

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
            <div className="flex items-center space-x-2">
              {!isEditMode ? (
                <Button onClick={enterEditMode} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Payment
                </Button>
              ) : (
                <>
                  <Button onClick={cancelEdit} variant="outline" disabled={editLoading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={saveChanges} disabled={editLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
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
                    {isEditMode ? (
                      <div className="mt-1">
                        <Input
                          type="date"
                          value={editFormData.payment_date}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                          className={editErrors.payment_date ? 'border-red-500' : ''}
                        />
                        {editErrors.payment_date && (
                          <p className="text-red-500 text-sm mt-1">{editErrors.payment_date}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
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
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference Number</label>
                  {isEditMode ? (
                    <div className="mt-1">
                      <Input
                        value={editFormData.reference_number}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                        placeholder="Check number, wire reference, etc."
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">{payment.reference_number || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  {isEditMode ? (
                    <div className="mt-1">
                      <Textarea
                        value={editFormData.notes}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        placeholder="Additional notes about this payment..."
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">{payment.notes || '-'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Line Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Payment Line Items ({isEditMode ? editLineItems.length : paymentItems.length})
                  </div>
                  {isEditMode && (
                    <Button onClick={addLineItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line Item
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(isEditMode ? editLineItems : paymentItems).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No line items found</p>
                    <p className="text-sm">This payment doesn't have detailed line item breakdown.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(isEditMode ? editLineItems : paymentItems).map((item, index) => (
                      <div key={item.id} className={`border rounded-lg p-4 ${isEditMode ? 'bg-white' : 'bg-gray-50'}`}>
                        {isEditMode ? (
                          // Edit mode - show form fields
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Line Item {index + 1}</h4>
                              {editLineItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLineItem(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`amount_${index}`}>Amount *</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    id={`amount_${index}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.amount || ''}
                                    onChange={(e) => updateLineItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                    className={`pl-8 ${editErrors[`lineItem_${index}_amount`] ? 'border-red-500' : ''}`}
                                    placeholder="0.00"
                                  />
                                </div>
                                {editErrors[`lineItem_${index}_amount`] && (
                                  <p className="text-red-500 text-sm mt-1">{editErrors[`lineItem_${index}_amount`]}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor={`description_${index}`}>Description *</Label>
                                <Input
                                  id={`description_${index}`}
                                  value={item.description}
                                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                  className={editErrors[`lineItem_${index}_description`] ? 'border-red-500' : ''}
                                  placeholder="e.g., Q2 Commission, Adjustment, etc."
                                />
                                {editErrors[`lineItem_${index}_description`] && (
                                  <p className="text-red-500 text-sm mt-1">{editErrors[`lineItem_${index}_description`]}</p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label htmlFor={`line_notes_${index}`}>Line Item Notes</Label>
                              <Textarea
                                id={`line_notes_${index}`}
                                value={item.notes || ''}
                                onChange={(e) => updateLineItem(index, 'notes', e.target.value)}
                                rows={2}
                                placeholder="Optional notes for this line item..."
                              />
                            </div>
                          </div>
                        ) : (
                          // View mode - show formatted data
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-sm font-medium text-gray-600 mr-2">
                                  Line Item {index + 1}
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                  ${Number(item.amount).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-gray-900 font-medium">{item.description}</p>
                              {item.notes && (
                                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Total Summary */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Payment Amount:</span>
                        <span className="text-xl font-bold text-gray-900">
                          ${(isEditMode ? editLineItems : paymentItems).reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)}
                        </span>
                      </div>
                      {editErrors.total && (
                        <p className="text-red-500 text-sm mt-2 text-right">{editErrors.total}</p>
                      )}
                    </div>
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