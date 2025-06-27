import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Company } from './types';
import './App.css';

function App() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selectedCompany');
    if (stored) {
      setSelectedCompany(JSON.parse(stored));
    }
  }, []);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  };

  const handleLogout = () => {
    setSelectedCompany(null);
    localStorage.removeItem('selectedCompany');
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              selectedCompany ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onCompanySelect={handleCompanySelect} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              selectedCompany ? 
                <Dashboard company={selectedCompany} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;