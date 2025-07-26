
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';
import { accountantRoutes } from './accountantRoutes';
import { AuthProvider } from '../contexts/auth';
import { OnboardingProvider } from '../components/onboarding/OnboardingProvider';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { AppLayout } from '../components/layout/AppLayout';
import OnboardingDemo from '../pages/OnboardingDemo';
import VoiceAgentSetupPage from '../pages/VoiceAgentSetupPage';
import VoiceAgentPage from '../pages/VoiceAgentPage';

// Rotas que NÃO devem usar o layout principal
const NO_LAYOUT_ROUTES = ['/login', '/register', '/ux-demo', '/voice-agent/setup', '/voice-agent'];

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  const location = useLocation();
  const shouldUseLayout = !NO_LAYOUT_ROUTES.includes(location.pathname);
  
  const routeContent = (
    <Routes>
      {/* Demo route for UX improvements */}
      <Route path="/ux-demo" element={<OnboardingDemo />} />
      
      {/* Voice Agent routes */}
      <Route path="/voice-agent/setup" element={<VoiceAgentSetupPage />} />
      <Route path="/voice-agent" element={<VoiceAgentPage />} />
      
      {/* Render all route arrays by spreading them */}
      {[...publicRoutes, ...protectedRoutes, ...accountantRoutes, ...adminRoutes]}
    </Routes>
  );
  
  return (
    <AuthProvider>
      <OnboardingProvider>
        {shouldUseLayout ? (
          <AppLayout>
            {routeContent}
          </AppLayout>
        ) : (
          routeContent
        )}
        <OnboardingModal />
      </OnboardingProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
