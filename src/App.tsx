
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryProvider } from "./hooks/useSupabaseQuery";
import { EnhancedErrorBoundary } from "./components/ui/enhanced-error-boundary";
import { LoadingProvider } from "./hooks/useLoadingState";
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
      <EnhancedErrorBoundary 
        showDetails={true}
        onError={(error, errorInfo) => {
          // Log error to external service in production
          console.error('Global app error:', error, errorInfo);
        }}
      >
        <LoadingProvider>
          <RouterProvider router={router} />
          <Toaster />
          <GlobalLoadingIndicator />
        </LoadingProvider>
      </EnhancedErrorBoundary>
    </QueryProvider>
  );
}

export default App;
