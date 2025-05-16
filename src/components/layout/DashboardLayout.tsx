
import React, { ReactNode, useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { VoiceAssistant } from '@/components/dashboard/VoiceAssistant';
import TourController from '@/components/dashboard/TourController';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar se o usuário está em uma rota de autenticação
  const isAuthRoute = location.pathname === '/login' || 
                      location.pathname === '/signup' || 
                      location.pathname === '/client-access';
  
  // Redirecionar para login se não estiver autenticado e não estiver em uma rota de autenticação
  useEffect(() => {
    // Somente redirecionar se não estiver em uma rota de autenticação
    if (!isLoading && !isAuthenticated && !isAuthRoute) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, isAuthRoute]);
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se não estiver autenticado e não estiver em uma rota de autenticação, mostrar botão para ir para o login
  if (!isAuthenticated && !isAuthRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="mb-6 text-muted-foreground">Você precisa fazer login para acessar esta página</p>
          <Button 
            onClick={() => navigate("/login")}
            size="lg"
          >
            Ir para o Login
          </Button>
        </div>
      </div>
    );
  }

  // Se estiver em uma rota de autenticação, não mostrar o layout do dashboard
  if (isAuthRoute) {
    return children || <Outlet />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <div className="sidebar-nav">
          <DashboardSidebar 
            isVoiceActive={isVoiceActive}
            toggleVoiceAssistant={toggleVoiceAssistant}
          />
        </div>
        
        <main className="flex-1 overflow-auto dashboard-main">
          <DashboardHeader 
            isVoiceActive={isVoiceActive} 
            toggleVoiceAssistant={toggleVoiceAssistant} 
          />
          
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>
        
        {isVoiceActive && (
          <VoiceAssistant isActive={isVoiceActive} onToggle={toggleVoiceAssistant} />
        )}
        
        <TourController />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
