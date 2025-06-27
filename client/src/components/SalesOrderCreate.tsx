import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Customer, Supplier, Part, CreateSalesOrderData } from '../types';
import { createSalesOrder, getCustomers, getSuppliers, getParts } from '../api';
import { ArrowLeft, Building2, Truck, Package, Plus, Trash2 } from 'lucide-react';

interface SalesOrderCreateProps {
  companyId: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  part_id: number;
  supplier_id: number;
  quantity: number;
  unit_price: number;
  commission_percentage: number;
}

export default function SalesOrderCreate({ companyId, onBack, onSuccess }: SalesOrderCreateProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    supplier_id: '',
    po_number: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: ''
  });
  
  const [items, setItems] = useState<OrderItem[]>([{
    part_id: 0,
    supplier_id: 0,
    quantity: 1,
    unit_price: 0,
    commission_percentage: 0
  }]);

  // Get parts for the selected supplier
  const availableParts = allParts.filter(part => 
    !formData.supplier_id || part.supplier_id === parseInt(formData.supplier_id)
  );

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      const [customersData, suppliersData, partsData] = await Promise.all([
        getCustomers(companyId),
        getSuppliers(companyId),
        getParts(companyId)
      ]);
      setCustomers(customersData);
      setSuppliers(suppliersData);
      setAllParts(partsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      supplier_id: '', // Reset supplier when customer changes
    }));
    // Reset items when customer changes
    setItems([{
      part_id: 0,
      supplier_id: 0,
      quantity: 1,
      unit_price: 0,
      commission_percentage: 0
    }]);
  };

  const handleSupplierChange = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      supplier_id: supplierId
    }));
    // Update all items to use the selected supplier and reset parts
    const supplierIdNum = parseInt(supplierId);
    setItems(prev => prev.map(item => ({
      ...item,
      supplier_id: supplierIdNum,
      part_id: 0,
      unit_price: 0
    })));
  };

  const addItem = () => {
    setItems([...items, {
      part_id: 0,
      supplier_id: parseInt(formData.supplier_id) || 0,
      quantity: 1,
      unit_price: 0,
      commission_percentage: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-populate unit_price when part is selected
    if (field === 'part_id') {
      const selectedPart = allParts.find(p => p.id === parseInt(value));
      if (selectedPart) {
        updatedItems[index].unit_price = selectedPart.price || 0;
      }
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    return items.reduce((acc, item) => {
      const lineTotal = item.quantity * item.unit_price;
      const commissionAmount = lineTotal * item.commission_percentage / 100;
      return {
        totalSales: acc.totalSales + lineTotal,
        totalCommission: acc.totalCommission + commissionAmount
      };
    }, { totalSales: 0, totalCommission: 0 });
  };

  const canAddItems = formData.customer_id && formData.supplier_id;
  const selectedSupplier = suppliers.find(s => s.id === parseInt(formData.supplier_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.supplier_id || !formData.po_number || items.some(item => !item.part_id || item.quantity <= 0)) {
      alert('Please fill in all required fields and ensure all line items have valid parts and quantities');
      return;
    }

    setSubmitting(true);
    try {
      const salesOrderData: CreateSalesOrderData = {
        customer_id: parseInt(formData.customer_id),
        po_number: formData.po_number,
        order_date: formData.order_date,
        status: formData.status,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          part_id: item.part_id,
          supplier_id: item.supplier_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          commission_percentage: item.commission_percentage
        }))
      };

      await createSalesOrder(companyId, salesOrderData);
      onSuccess();
    } catch (error) {
      console.error('Error creating sales order:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error creating sales order: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Sales Order</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Step 1: Select Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={formData.customer_id} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="po_number">PO Number *</Label>
                  <Input
                    id="po_number"
                    value={formData.po_number}
                    onChange={(e) => setFormData({...formData, po_number: e.target.value})}
                    placeholder="PO-2024-001"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Supplier Selection */}
          <Card className={!formData.customer_id ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-green-600" />
                Step 2: Select Supplier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select 
                    value={formData.supplier_id} 
                    onValueChange={handleSupplierChange}
                    disabled={!formData.customer_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSupplier && (
                    <p className="text-sm text-gray-500 mt-1">
                      {availableParts.length} parts available
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="order_date">Order Date</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Line Items */}
          <Card className={!canAddItems ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Step 3: Add Line Items
                </div>
                <Button 
                  type="button" 
                  onClick={addItem} 
                  size="sm"
                  disabled={!canAddItems}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!canAddItems ? (
                <p className="text-gray-500 text-center py-8">
                  Please select a customer and supplier first
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const selectedPart = allParts.find(p => p.id === item.part_id);
                    const lineTotal = item.quantity * item.unit_price;
                    const commissionAmount = lineTotal * item.commission_percentage / 100;
                    
                    return (
                      <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-gray-50">
                        <div className="col-span-4">
                          <Label>Part *</Label>
                          <Select value={item.part_id.toString()} onValueChange={(value) => updateItem(index, 'part_id', parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select part" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableParts.map(part => (
                                <SelectItem key={part.id} value={part.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{part.name}</span>
                                    <span className="text-sm text-gray-500">{part.sku}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Label>Comm %</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.commission_percentage}
                            onChange={(e) => updateItem(index, 'commission_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Label>Line Total</Label>
                          <div className="text-sm font-medium pt-2">${lineTotal.toFixed(2)}</div>
                        </div>
                        
                        <div className="col-span-1">
                          <Label>Commission</Label>
                          <div className="text-sm font-medium pt-2 text-green-600">${commissionAmount.toFixed(2)}</div>
                        </div>
                        
                        <div className="col-span-1">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals and Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg">
                  <span className="font-semibold">Total Sales: </span>
                  <span className="text-2xl font-bold">${totals.totalSales.toFixed(2)}</span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold text-green-600">Total Commission: </span>
                  <span className="text-2xl font-bold text-green-600">${totals.totalCommission.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting || !formData.customer_id || !formData.supplier_id || !formData.po_number || items.some(item => !item.part_id || item.quantity <= 0)}
                  className="min-w-[120px]"
                >
                  {submitting ? 'Creating...' : 'Create Sales Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}