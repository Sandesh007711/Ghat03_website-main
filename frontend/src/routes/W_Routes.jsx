import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import OperatorDashboard from '../pages/operator/operator-dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/operator/*" element={
        <ProtectedRoute requiredRole="operator">
          <OperatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/*" element={
        <ProtectedRoute requiredRole="admin">
          <Home />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;