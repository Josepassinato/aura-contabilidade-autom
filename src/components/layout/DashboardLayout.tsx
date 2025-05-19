
import React, { ReactNode, useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { VoiceAssistant } from '@/components/dashboard/VoiceAssistant';
import TourController from '@/components/dashboard/TourController';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { checkForAuthLimboState, cleanupAuthState } from '@/contexts/auth/cleanupUtils';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [initialCheckCompleted, setInitialCheckCompleted] = useState(false);
  
  // Verificar imediatamente se o usuário está autenticado
  useEffect(() => {
    console.log("DashboardLayout - Verificando estado de autenticação");
    
    // Verificar e corrigir estado de autenticação inconsistente
    if (checkForAuthLimboState()) {
      console.log("Estado de autenticação inconsistente detectado, limpando");
      cleanupAuthState();
      toast({
        title: "Estado de autenticação inconsistente detectado",
        description: "O sistema resolveu um conflito de sessão. Por favor, faça login novamente.",
        variant: "destructive",
      });
      window.location.href = '/login';
      return;
    }

    // Log da rota atual para ajudar na depuração
    console.log("Rota atual:", location.pathname);
    
    if (!isLoading) {
      setInitialCheckCompleted(true);
      if (!isAuthenticated) {
        console.log("Usuário não autenticado no DashboardLayout, redirecionando para login");
        // Força redirecionamento para login página de login quando não autenticado
        window.location.href = '/login';
      }
    }
  }, [location, isAuthenticated, isLoading]);
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (isLoading || !initialCheckCompleted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  // Se não estiver autenticado, mostrar botão para ir para o login
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="mb-6 text-muted-foreground">Você precisa fazer login para acessar esta página</p>
          <Button 
            onClick={() => window.location.href = '/login'}
            size="lg"
          >
            Ir para o Login
          </Button>
        </div>
      </div>
    );
  }

  // Se estiver autenticado, renderiza o layout do dashboard
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
