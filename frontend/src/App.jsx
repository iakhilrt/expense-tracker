import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

// Placeholder components for other pages
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
