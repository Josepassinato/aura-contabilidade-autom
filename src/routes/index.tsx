
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';
import { accountantRoutes } from './accountantRoutes';
import { AuthProvider } from '../contexts/auth';
import { OnboardingProvider } from '../components/onboarding/OnboardingProvider';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import OnboardingDemo from '../pages/OnboardingDemo';

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Routes>
          {/* Demo route for UX improvements */}
          <Route path="/ux-demo" element={<OnboardingDemo />} />
          
          {/* Render all route arrays by spreading them */}
          {[...publicRoutes, ...protectedRoutes, ...accountantRoutes, ...adminRoutes]}
        </Routes>
        <OnboardingModal />
      </OnboardingProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
