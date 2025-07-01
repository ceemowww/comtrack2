import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Company, Supplier, CreateCommissionPaymentLineItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Plus, Trash2, DollarSign } from 'lucide-react';

interface CommissionPaymentCreateProps {
  company: Company;
  onLogout: () => void;
}

const CommissionPaymentCreate: React.FC<CommissionPaymentCreateProps> = ({
  company,
  onLogout
}) => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplier_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: ''
  });

  const [lineItems, setLineItems] = useState<CreateCommissionPaymentLineItem[]>([
    { amount: 0, description: '', notes: '' }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await api.getSuppliers(company.id);
        setSuppliers(data);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      } finally {
        setSuppliersLoading(false);
      }
    };

    fetchSuppliers();
  }, [company.id]);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { amount: 0, description: '', notes: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof CreateCommissionPaymentLineItem, value: string | number) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setLineItems(updatedItems);
    
    // Clear any errors for this line item
    const errorKey = `lineItem_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }
    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }

    // Validate line items
    lineItems.forEach((item, index) => {
      if (!item.amount || item.amount <= 0) {
        newErrors[`lineItem_${index}_amount`] = 'Amount must be greater than 0';
      }
      if (!item.description || item.description.trim() === '') {
        newErrors[`lineItem_${index}_description`] = 'Description is required';
      }
    });

    if (calculateTotal() <= 0) {
      newErrors.total = 'Total payment amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.createCommissionPayment(company.id, {
        supplier_id: Number(formData.supplier_id),
        payment_date: formData.payment_date,
        line_items: lineItems.map(item => ({
          amount: item.amount,
          description: item.description,
          notes: item.notes || undefined
        })),
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create commission payment:', error);
      alert('Failed to create commission payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Create Commission Payment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{company.name}</span>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_id">Supplier *</Label>
                  <select
                    id="supplier_id"
                    value={formData.supplier_id}
                    onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={suppliersLoading}
                  >
                    <option value="">Select a supplier...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => handleInputChange('payment_date', e.target.value)}
                    className={errors.payment_date ? 'border-red-500' : ''}
                  />
                  {errors.payment_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                  placeholder="Check number, wire reference, etc."
                />
              </div>

              <div>
                <Label htmlFor="notes">Payment Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payment Line Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLineItem}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Line Item {index + 1}</h4>
                    {lineItems.length > 1 && (
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
                          className={`pl-8 ${errors[`lineItem_${index}_amount`] ? 'border-red-500' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors[`lineItem_${index}_amount`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`lineItem_${index}_amount`]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`description_${index}`}>Description *</Label>
                      <Input
                        id={`description_${index}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className={errors[`lineItem_${index}_description`] ? 'border-red-500' : ''}
                        placeholder="e.g., Q2 Commission, Adjustment, etc."
                      />
                      {errors[`lineItem_${index}_description`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`lineItem_${index}_description`]}</p>
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
              ))}

              {/* Total Display */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Payment Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${calculateTotal().toFixed(2)}
                    </p>
                    {errors.total && (
                      <p className="text-red-500 text-sm mt-1">{errors.total}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Payment...' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionPaymentCreate;