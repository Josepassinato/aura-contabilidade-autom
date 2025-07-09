
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/auth";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryProvider } from "./hooks/useSupabaseQuery";
import { GlobalErrorBoundary } from "./components/layout/GlobalErrorBoundary";
import { LoadingProvider } from "./hooks/useLoadingState";
import { OnboardingProvider } from "./components/onboarding/OnboardingProvider";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { GlobalLoadingIndicator } from "./components/layout/GlobalLoadingIndicator";
import AppRoutes from "./routes";

// Create the router using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "*",
    element: <AppRoutes />,
  }
]);

function App() {
  return (
    <QueryProvider>
      <GlobalErrorBoundary>
        <LoadingProvider>
          <RouterProvider router={router} />
          <Toaster />
          <GlobalLoadingIndicator />
        </LoadingProvider>
      </GlobalErrorBoundary>
    </QueryProvider>
  );
}

export default App;
