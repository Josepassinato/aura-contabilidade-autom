
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
  // Forçar redirecionamento para login no carregamento inicial
  useEffect(() => {
    // Verificar se estamos na raiz do site '/' sem vir do login
    const currentPath = window.location.pathname;
    console.log("App.tsx - Caminho atual:", currentPath);
    
    if (currentPath === '/' || currentPath === '') {
      console.log("App.tsx - Redirecionando para login da raiz");
      window.location.href = '/login';
      return;
    }
    
    // Limpar sinalizador quando o componente for desmontado
    return () => {
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
