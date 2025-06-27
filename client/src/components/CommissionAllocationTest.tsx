import React, { useState } from 'react';
import { CommissionPayment, CommissionOutstandingDetail } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog } from './ui/dialog';
import { DollarSign, X } from 'lucide-react';

interface CommissionAllocationTestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: CommissionPayment;
  outstandingItems: CommissionOutstandingDetail[];
  onSubmit: (allocation: {commission_payment_id: number, sales_order_item_id: number, allocated_amount: number, notes?: string}) => Promise<void>;
  loading: boolean;
}

const CommissionAllocationTest: React.FC<CommissionAllocationTestProps> = ({
  open,
  onOpenChange,
  payment,
  outstandingItems,
  onSubmit,
  loading
}) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [allocateAmount, setAllocateAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleAllocate = async () => {
    if (!selectedItem || !allocateAmount || parseFloat(allocateAmount) <= 0) {
      return;
    }

    try {
      await onSubmit({
        commission_payment_id: payment.id,
        sales_order_item_id: selectedItem,
        allocated_amount: parseFloat(allocateAmount),
        notes: notes || undefined
      });
      
      // Reset form
      setSelectedItem(null);
      setAllocateAmount('');
      setNotes('');
    } catch (error) {
      console.error('Failed to allocate:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Test Allocation - Payment ${Number(payment.total_amount).toFixed(2)}
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Select Item to Allocate To:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {outstandingItems.map(item => (
                  <label
                    key={item.sales_order_item_id}
                    className={`flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedItem === item.sales_order_item_id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="item"
                      value={item.sales_order_item_id}
                      checked={selectedItem === item.sales_order_item_id}
                      onChange={() => setSelectedItem(item.sales_order_item_id)}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.po_number} - {item.customer_name}</div>
                      <div className="text-sm text-gray-600">{item.part_name} ({item.sku})</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">${Number(item.outstanding_amount).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">outstanding</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedItem && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="text-sm font-medium">Allocate Amount</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={allocateAmount}
                      onChange={(e) => setAllocateAmount(e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                    placeholder="Any notes about this allocation..."
                  />
                </div>

                <Button 
                  onClick={handleAllocate} 
                  disabled={loading || !allocateAmount || parseFloat(allocateAmount) <= 0}
                  className="w-full"
                >
                  {loading ? 'Allocating...' : 'Allocate Amount'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Dialog>
  );
};

export default CommissionAllocationTest;