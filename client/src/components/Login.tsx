import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Company } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface LoginProps {
  onCompanySelect: (company: Company) => void;
}

const Login: React.FC<LoginProps> = ({ onCompanySelect }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await api.getCompanies();
        setCompanies(data);
      } catch (err) {
        setError('Failed to load companies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ComTrack</h1>
          <h2 className="text-xl text-gray-600">Select Your Company</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {companies.map(company => (
            <Card 
              key={company.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCompanySelect(company)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{company.name}</CardTitle>
                {company.description && (
                  <CardDescription>{company.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full">Select Company</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;