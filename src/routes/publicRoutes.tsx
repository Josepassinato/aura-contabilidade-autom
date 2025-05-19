
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

// Export an array of Route elements instead of a component
export const publicRoutes = [
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="plans" path="/plans" element={<PlansAndPricing />} />,
  <Route key="payment-success" path="/payment/success" element={<PaymentSuccess />} />,
  <Route key="payment-canceled" path="/payment/canceled" element={<PaymentCanceled />} />,
  <Route key="onboarding-welcome" path="/onboarding-welcome" element={<OnboardingWelcome />} />,
  <Route key="onboarding" path="/onboarding" element={<Onboarding />} />,
  <Route key="client-access" path="/client-access" element={<ClientAccess />} />,
  
  /* Client portal routes */
  <Route key="client-portal" path="/client-portal/*" element={<ClientPortal />} />,
  
  /* Catch-all route for 404 */
  <Route key="not-found" path="*" element={<NotFound />} />,
];
