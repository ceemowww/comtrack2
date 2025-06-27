import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { SalesOrderWithItems } from '../types';
import { getSalesOrder } from '../api';
import { ArrowLeft, Building2, Calendar, FileText, Package, DollarSign, CreditCard, Truck } from 'lucide-react';

interface SalesOrderDetailProps {
  companyId: number;
  orderId: number;
  onBack: () => void;
}

export default function SalesOrderDetail({ companyId, orderId, onBack }: SalesOrderDetailProps) {
  const [order, setOrder] = useState<SalesOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

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
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sales Order {order.po_number}</h1>
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
            
            {order.notes && (
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
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Line Items ({order.items?.length || 0})
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item, index) => {
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
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Totals Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-lg">
                  <span className="font-semibold">Total Sales: </span>
                  <span className="text-xl font-bold">${totals.totalSales.toFixed(2)}</span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold text-green-600">Total Commission: </span>
                  <span className="text-xl font-bold text-green-600">${totals.totalCommission.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}