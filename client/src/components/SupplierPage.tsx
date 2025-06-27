import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Company, Supplier } from '../types';
import SupplierDetail from './SupplierDetail';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface SupplierPageProps {
  company: Company;
  onLogout: () => void;
}

const SupplierPage: React.FC<SupplierPageProps> = ({ company, onLogout }) => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) {
        setError('Supplier ID not provided');
        setLoading(false);
        return;
      }

      try {
        const suppliers = await api.getSuppliers(company.id);
        const foundSupplier = suppliers.find(s => s.id === parseInt(supplierId));
        
        if (!foundSupplier) {
          setError('Supplier not found');
        } else {
          setSupplier(foundSupplier);
        }
      } catch (err) {
        console.error('Failed to fetch supplier:', err);
        setError('Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [company.id, supplierId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading supplier...</div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || 'Supplier not found'}</div>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{company.name}</h1>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SupplierDetail 
          supplier={supplier} 
          companyId={company.id} 
          onBack={handleBack}
        />
      </main>
    </div>
  );
};

export default SupplierPage;