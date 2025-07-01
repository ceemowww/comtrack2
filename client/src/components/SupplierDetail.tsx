import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Supplier, Part, SalesOrderWithItems, SupplierCommissionSummary } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Package, FileText, DollarSign, Calendar, User } from 'lucide-react';

interface SupplierDetailProps {
  supplier: Supplier;
  companyId: number;
  onBack: () => void;
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplier, companyId, onBack }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrderWithItems[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<SupplierCommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'parts' | 'orders'>('overview');

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        const [allParts, allOrders, commissionData] = await Promise.all([
          api.getParts(companyId),
          api.getSalesOrdersWithItems(companyId),
          api.getSupplierCommissionSummary(companyId, supplier.id)
        ]);
        
        // Filter parts for this supplier
        const supplierParts = allParts.filter(part => part.supplier_id === supplier.id);
        setParts(supplierParts);
        
        // Filter sales orders to only show orders containing this supplier's parts
        const supplierOrders = allOrders.filter(order => 
          order.items && 
          order.items.some(item => item.supplier_id === supplier.id)
        );
        setSalesOrders(supplierOrders);
        
        setCommissionSummary(commissionData);
      } catch (err) {
        console.error('Failed to fetch supplier data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [companyId, supplier.id]);


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
              {commissionSummary ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Commission Generated</label>
                    <p className="text-2xl font-bold text-gray-900">${commissionSummary.total_commission_generated.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Commission Paid</label>
                    <p className="text-lg font-semibold text-green-600">${commissionSummary.total_commission_paid.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Commission Allocated</label>
                    <p className="text-lg font-semibold text-blue-600">${commissionSummary.total_commission_allocated.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Outstanding Commission</label>
                    <p className="text-lg font-semibold text-red-600">${commissionSummary.commission_outstanding.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Unallocated Payments</label>
                    <p className="text-lg font-semibold text-orange-600">${commissionSummary.unallocated_payments.toFixed(2)}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">Loading commission data...</div>
              )}
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



    </div>
  );
};

export default SupplierDetail;