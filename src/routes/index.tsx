
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './publicRoutes';
import { ProtectedRoutes } from './protectedRoutes';
import { AdminRoutes } from './adminRoutes';
import { AccountantRoutes } from './accountantRoutes';

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  
  return (
    <Routes>
      {/* Spread the routes from each route collection */}
      <PublicRoutes />
      <ProtectedRoutes />
      <AccountantRoutes />
      <AdminRoutes />
    </Routes>
  );
};

export default AppRoutes;
