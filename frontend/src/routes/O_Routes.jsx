import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/operator/Op_Home';
import Print_token_report from '../pages/operator/Print_Token_Report';
import Loaded from '../pages/operator/Loaded';
import ProtectedRoute from '../components/ProtectedRoute';

const O_Routes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute requiredRole="operator">
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/print-token-report" 
        element={
          <ProtectedRoute requiredRole="operator">
            <Print_token_report />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/loaded" 
        element={
          <ProtectedRoute requiredRole="operator">
            <Loaded />
          </ProtectedRoute>
        }
      />
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default O_Routes;