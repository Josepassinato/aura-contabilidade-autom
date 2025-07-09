
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';
import { accountantRoutes } from './accountantRoutes';
import OnboardingDemo from '../pages/OnboardingDemo';

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  
  return (
    <Routes>
      {/* Demo route for UX improvements */}
      <Route path="/ux-demo" element={<OnboardingDemo />} />
      
      {/* Render all route arrays by spreading them */}
      {[...publicRoutes, ...protectedRoutes, ...accountantRoutes, ...adminRoutes]}
    </Routes>
  );
};

export default AppRoutes;
