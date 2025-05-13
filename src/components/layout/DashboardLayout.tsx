
import React, { ReactNode, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { VoiceAssistant } from '@/components/dashboard/VoiceAssistant';
import TourController from '@/components/dashboard/TourController';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { isAuthenticated, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  // Se não estiver autenticado, mostrar botão para ir para o login
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="mb-6 text-muted-foreground">Você precisa fazer login para acessar esta página</p>
          <Button 
            onClick={() => {
              console.log("Redirecionando para login...");
              navigate("/login");
            }} 
            size="lg"
          >
            Ir para o Login
          </Button>
        </div>
      </div>
    );
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
