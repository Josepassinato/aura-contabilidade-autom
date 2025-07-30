
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';
import { accountantRoutes } from './accountantRoutes';
import { AuthProvider } from '../contexts/auth';
import { OnboardingProvider } from '../components/onboarding/OnboardingProvider';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { LoadingSpinner } from '../components/ui/loading-spinner';

// Lazy loading de páginas específicas para melhor performance
const OnboardingDemo = React.lazy(() => import('../pages/OnboardingDemo'));
const VoiceAgentSetupPage = React.lazy(() => import('../pages/VoiceAgentSetupPage'));
const VoiceAgentPage = React.lazy(() => import('../pages/VoiceAgentPage'));

// Componente de loading para fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes with lazy loading");
  
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Demo route for UX improvements */}
            <Route 
              path="/ux-demo" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <OnboardingDemo />
                </Suspense>
              } 
            />
            
            {/* Voice Agent routes with lazy loading */}
            <Route 
              path="/voice-agent/setup" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <VoiceAgentSetupPage />
                </Suspense>
              } 
            />
            <Route 
              path="/voice-agent" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <VoiceAgentPage />
                </Suspense>
              } 
            />
            
            {/* Render all route arrays (já carregadas estaticamente) */}
            {[...publicRoutes, ...protectedRoutes, ...accountantRoutes, ...adminRoutes]}
          </Routes>
        </Suspense>
        <OnboardingModal />
      </OnboardingProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
