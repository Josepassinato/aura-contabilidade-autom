
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';
import { accountantRoutes } from './accountantRoutes';

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  
  return (
    <Routes>
      {/* Render all route arrays by spreading them */}
      {[...publicRoutes, ...protectedRoutes, ...accountantRoutes, ...adminRoutes]}
    </Routes>
  );
};

export default AppRoutes;

