
import React from "react";
import { SidebarFooter, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth";
import { Settings, LogOut, HelpCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FooterSection() {
  const { isAuthenticated, logout, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout?.();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      window.location.href = '/login';
    }
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <SidebarFooter>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate('/settings')}
          tooltip="Configurações"
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => window.open('https://docs.contaflix.com.br', '_blank')}
          tooltip="Ajuda"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Ajuda</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {isAuthenticated ? (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            tooltip="Sair"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogin}
            tooltip="Login"
          >
            <LogIn className="h-5 w-5" />
            <span>Entrar</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarFooter>
  );
}
