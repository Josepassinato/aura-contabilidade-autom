
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/auth";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryProvider } from "./hooks/useSupabaseQuery";
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
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
