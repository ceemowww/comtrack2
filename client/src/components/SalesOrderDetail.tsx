import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { SalesOrderWithItems, Customer, Supplier, Part } from '../types';
import { getSalesOrder, updateSalesOrder, getCustomers, getSuppliers, getParts } from '../api';
import { ArrowLeft, Building2, Calendar, FileText, Package, DollarSign, CreditCard, Truck, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

interface SalesOrderDetailProps {
  companyId: number;
  orderId: number;
  onBack: () => void;
}

export default function SalesOrderDetail({ companyId, orderId, onBack }: SalesOrderDetailProps) {
  const [order, setOrder] = useState<SalesOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form data for editing
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [editFormData, setEditFormData] = useState({
    customer_id: '',
    po_number: '',
    order_date: '',
    status: '',
    notes: ''
  });
  const [editItems, setEditItems] = useState<any[]>([]);

  useEffect(() => {
    loadOrderDetails();
  }, [companyId, orderId]);

  const loadOrderDetails = async () => {
    try {
      const orderData = await getSalesOrder(companyId, orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
      alert('Error loading order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEditData = async () => {
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
      console.error('Error loading edit data:', error);
      alert('Error loading edit data. Please try again.');
    }
  };

  const startEditing = async () => {
    if (!order) return;
    
    await loadEditData();
    
    // Initialize form data with current order values
    setEditFormData({
      customer_id: order.customer_id?.toString() || '',
      po_number: order.po_number,
      order_date: new Date(order.order_date).toISOString().split('T')[0],
      status: order.status,
      notes: order.notes || ''
    });
    
    // Initialize edit items with current items
    setEditItems(order.items?.map(item => ({
      part_id: item.part_id,
      supplier_id: item.supplier_id,
      quantity: item.quantity,
      unit_price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price,
      commission_percentage: typeof item.commission_percentage === 'string' ? parseFloat(item.commission_percentage) : item.commission_percentage
    })) || []);
    
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFormData({
      customer_id: '',
      po_number: '',
      order_date: '',
      status: '',
      notes: ''
    });
    setEditItems([]);
  };

  const handleSave = async () => {
    if (!order || editItems.length === 0) {
      alert('Please add at least one item to the order.');
      return;
    }

    setSaving(true);
    try {
      const orderData = {
        customer_id: parseInt(editFormData.customer_id),
        po_number: editFormData.po_number,
        order_date: editFormData.order_date,
        status: editFormData.status,
        notes: editFormData.notes,
        items: editItems
      };

      await updateSalesOrder(companyId, orderId, orderData);
      await loadOrderDetails(); // Reload to get updated data
      setIsEditing(false);
      alert('Sales order updated successfully!');
    } catch (error) {
      console.error('Error updating sales order:', error);
      alert('Error updating sales order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Line item editing functions
  const addLineItem = () => {
    setEditItems([...editItems, {
      part_id: 0,
      supplier_id: 0,
      quantity: 1,
      unit_price: 0,
      commission_percentage: 0
    }]);
  };

  const removeLineItem = (index: number) => {
    if (editItems.length > 1) {
      setEditItems(editItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...editItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-update supplier when part is selected
    if (field === 'part_id') {
      const selectedPart = allParts.find(p => p.id === parseInt(value));
      if (selectedPart) {
        updatedItems[index].supplier_id = selectedPart.supplier_id;
      }
    }
    
    setEditItems(updatedItems);
  };

  const calculateEditTotals = () => {
    if (!editItems.length) return { totalSales: 0, totalCommission: 0 };
    
    return editItems.reduce((acc, item) => {
      const lineTotal = item.quantity * item.unit_price;
      const commissionAmount = lineTotal * item.commission_percentage / 100;
      
      return {
        totalSales: acc.totalSales + lineTotal,
        totalCommission: acc.totalCommission + commissionAmount
      };
    }, { totalSales: 0, totalCommission: 0 });
  };

  const calculateTotals = () => {
    if (!order?.items) return { totalSales: 0, totalCommission: 0 };
    
    return order.items.reduce((acc, item) => {
      const lineTotal = typeof item.line_total === 'string' 
        ? parseFloat(item.line_total) 
        : (item.line_total || (item.quantity * item.unit_price));
      const commissionAmount = typeof item.commission_amount === 'string'
        ? parseFloat(item.commission_amount)
        : (item.commission_amount || (lineTotal * item.commission_percentage / 100));
      
      return {
        totalSales: acc.totalSales + lineTotal,
        totalCommission: acc.totalCommission + commissionAmount
      };
    }, { totalSales: 0, totalCommission: 0 });
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales Orders
            </Button>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Sales Order {order.po_number}</h1>
              </div>
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Order Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Information</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customer">Customer *</Label>
                    <Select value={editFormData.customer_id} onValueChange={(value) => setEditFormData({...editFormData, customer_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
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
                      value={editFormData.po_number}
                      onChange={(e) => setEditFormData({...editFormData, po_number: e.target.value})}
                      placeholder="Enter PO number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="order_date">Order Date</Label>
                    <Input
                      id="order_date"
                      type="date"
                      value={editFormData.order_date}
                      onChange={(e) => setEditFormData({...editFormData, order_date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    placeholder="Enter any notes..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="font-medium">${totals.totalSales.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total Commission</p>
                    <p className="font-medium text-green-600">${totals.totalCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!isEditing && order.notes && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Line Items ({isEditing ? editItems.length : (order.items?.length || 0)})
              </div>
              {isEditing && (
                <Button onClick={addLineItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Line Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission $
                    </th>
                    {isEditing && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isEditing ? (
                    // Edit mode - show editable form controls
                    editItems.map((item, index) => {
                      const lineTotal = item.quantity * item.unit_price;
                      const commissionAmount = lineTotal * item.commission_percentage / 100;
                      const availableParts = allParts.filter(p => p.supplier_id === item.supplier_id);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Select 
                              value={item.part_id.toString()} 
                              onValueChange={(value) => updateLineItem(index, 'part_id', parseInt(value))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select part" />
                              </SelectTrigger>
                              <SelectContent>
                                {allParts.map(part => (
                                  <SelectItem key={part.id} value={part.id.toString()}>
                                    <div>
                                      <div className="font-medium">{part.name}</div>
                                      <div className="text-sm text-gray-500">{part.sku}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4">
                            <Select 
                              value={item.supplier_id.toString()} 
                              onValueChange={(value) => updateLineItem(index, 'supplier_id', parseInt(value))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map(supplier => (
                                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            ${lineTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.commission_percentage}
                              onChange={(e) => updateLineItem(index, 'commission_percentage', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            ${commissionAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                              disabled={editItems.length === 1}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // Read-only mode - show current items
                    order.items?.map((item, index) => {
                      const lineTotal = typeof item.line_total === 'string' 
                        ? parseFloat(item.line_total) 
                        : (item.line_total || (item.quantity * item.unit_price));
                      const commissionAmount = typeof item.commission_amount === 'string'
                        ? parseFloat(item.commission_amount)
                        : (item.commission_amount || (lineTotal * item.commission_percentage / 100));
                      const unitPrice = typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price;
                      const commissionPercentage = typeof item.commission_percentage === 'string' ? parseFloat(item.commission_percentage) : item.commission_percentage;
                      
                      return (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.part_name}</div>
                                <div className="text-sm text-gray-500">{item.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{item.supplier_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${lineTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {commissionPercentage.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ${commissionAmount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Totals Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-lg">
                  <span className="font-semibold">Total Sales: </span>
                  <span className="text-xl font-bold">
                    ${isEditing ? calculateEditTotals().totalSales.toFixed(2) : totals.totalSales.toFixed(2)}
                  </span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold text-green-600">Total Commission: </span>
                  <span className="text-xl font-bold text-green-600">
                    ${isEditing ? calculateEditTotals().totalCommission.toFixed(2) : totals.totalCommission.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}