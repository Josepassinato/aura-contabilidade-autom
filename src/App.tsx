
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/auth";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryProvider } from "./hooks/useSupabaseQuery";
import AppRoutes from "./routes";
import { checkForAuthLimboState, cleanupAuthState } from "@/contexts/auth/cleanupUtils";

// Limpar qualquer estado de autenticação inconsistente no carregamento inicial
const cleanupOnLoad = () => {
  console.log("App.tsx - Verificando e limpando estados de autenticação inconsistentes");
  // Verificar se há algum estado de autenticação inconsistente e limpar se necessário
  if (checkForAuthLimboState()) {
    console.log("Estado de autenticação inconsistente detectado ao carregar App, limpando");
    cleanupAuthState();
    // Force cache control to prevent stale authentication states
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('last_auth_cleanup', Date.now().toString());
    }
  }
};

// Executar a limpeza imediatamente
cleanupOnLoad();

// Create the router using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "*",
    element: <AppRoutes />,
  }
]);

function App() {
  // Add an effect to check auth state on every app load
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // If we're on the root path and not coming from login, redirect to login
    if (currentPath === '/' && !sessionStorage.getItem('from_login')) {
      window.location.href = '/login';
    }
    
    return () => {
      // Clean up the flag when component unmounts
      sessionStorage.removeItem('from_login');
    };
  }, []);

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
