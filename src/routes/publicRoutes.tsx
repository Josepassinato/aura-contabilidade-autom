
import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../pages/Login';
import PlansAndPricing from '../pages/PlansAndPricing';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentCanceled from '../pages/PaymentCanceled';
import OnboardingWelcome from '../pages/OnboardingWelcome';
import Onboarding from '../pages/Onboarding';
import ClientAccess from '../pages/ClientAccess';
import ClientPortal from '../pages/ClientPortal';
import NotFound from '../pages/NotFound';

export const PublicRoutes = () => {
  return (
    <>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/plans" element={<PlansAndPricing />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/canceled" element={<PaymentCanceled />} />
      <Route path="/onboarding-welcome" element={<OnboardingWelcome />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/client-access" element={<ClientAccess />} />
      
      {/* Client portal routes */}
      <Route path="/client-portal/*" element={<ClientPortal />} />
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </>
  );
};
