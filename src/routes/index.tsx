
import React from 'react';
import { Routes } from 'react-router-dom';
import { PublicRoutes } from './publicRoutes';
import { ProtectedRoutes } from './protectedRoutes';
import { AdminRoutes } from './adminRoutes';
import { AccountantRoutes } from './accountantRoutes';

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  
  return (
    <Routes>
      {/* Public Routes */}
      <PublicRoutes />
      
      {/* Protected Routes */}
      <ProtectedRoutes />
      
      {/* Accountant Routes */}
      <AccountantRoutes />
      
      {/* Admin Routes */}
      <AdminRoutes />
    </Routes>
  );
};

export default AppRoutes;
