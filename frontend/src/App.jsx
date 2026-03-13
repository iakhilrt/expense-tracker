import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* LOGIN PAGE */}
      <Route
        path="/"
        element={!user ? <Auth /> : <Navigate to="/dashboard" replace />}
      />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;