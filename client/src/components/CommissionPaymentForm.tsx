import React, { useState } from 'react';
import { CommissionPayment, Supplier } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog } from './ui/dialog';
import { DollarSign, X } from 'lucide-react';

interface CommissionPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  payment?: CommissionPayment | null;
  onSubmit: (paymentData: Omit<CommissionPayment, 'id' | 'company_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
}

const CommissionPaymentForm: React.FC<CommissionPaymentFormProps> = ({
  open,
  onOpenChange,
  suppliers,
  payment,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    supplier_id: payment?.supplier_id || '',
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    total_amount: payment?.total_amount?.toString() || '',
    reference_number: payment?.reference_number || '',
    notes: payment?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }
    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }
    if (!formData.total_amount || isNaN(Number(formData.total_amount)) || Number(formData.total_amount) <= 0) {
      newErrors.total_amount = 'Valid payment amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        supplier_id: Number(formData.supplier_id),
        payment_date: formData.payment_date,
        total_amount: Number(formData.total_amount),
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined
      });
      
      // Reset form
      setFormData({
        supplier_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        total_amount: '',
        reference_number: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to save commission payment:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              {payment ? 'Edit Commission Payment' : 'Record Commission Payment'}
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="supplier_id">Supplier *</Label>
                <select
                  id="supplier_id"
                  value={formData.supplier_id}
                  onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!payment} // Don't allow changing supplier for existing payments
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

              <div>
                <Label htmlFor="total_amount">Payment Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) => handleInputChange('total_amount', e.target.value)}
                    className={`pl-8 ${errors.total_amount ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.total_amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.total_amount}</p>
                )}
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Additional notes about this payment..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
                </Button>
              </div>
            </form>
        </CardContent>
      </Card>
    </Dialog>
  );
};

export default CommissionPaymentForm;