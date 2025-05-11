
import React, { ReactNode, useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { 
  BarChart, 
  FileText, 
  Settings, 
  Users, 
  Building, 
  Calendar, 
  Bell, 
  HelpCircle, 
  Mic 
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-primary">ContaFácil</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          {/* Menu principal */}
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Dashboard" isActive={true}>
                    <BarChart className="h-5 w-5" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Obrigações Fiscais">
                    <Calendar className="h-5 w-5" />
                    <span>Obrigações Fiscais</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Clientes">
                    <Building className="h-5 w-5" />
                    <span>Clientes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Documentos">
                    <FileText className="h-5 w-5" />
                    <span>Documentos</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Colaboradores">
                    <Users className="h-5 w-5" />
                    <span>Colaboradores</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Ferramentas */}
          <SidebarGroup>
            <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Notificações">
                    <Bell className="h-5 w-5" />
                    <span>Notificações</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Assistente de Voz" isActive={isVoiceActive} onClick={toggleVoiceAssistant}>
                    <Mic className="h-5 w-5" />
                    <span>Assistente de Voz</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <div className="flex flex-col gap-2">
            <SidebarMenuButton>
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </SidebarMenuButton>
            <SidebarMenuButton>
              <HelpCircle className="h-5 w-5" />
              <span>Ajuda</span>
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        <header className="h-16 px-6 border-b flex items-center justify-between bg-background">
          <div className="flex items-center">
            <ClientSelector />
          </div>
          <div className="flex items-center space-x-4">
            {isVoiceActive && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full animate-pulse-slow">
                <Mic className="h-5 w-5" />
                <span>Assistente de voz ativo</span>
              </div>
            )}
            <button 
              onClick={toggleVoiceAssistant}
              className={`p-2 rounded-full ${isVoiceActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Seletor de clientes para o contador
function ClientSelector() {
  const [selectedClient, setSelectedClient] = useState('Visão Geral');
  const clients = ['Visão Geral', 'Empresa ABC Ltda', 'XYZ Comércio S.A.', 'Tech Solutions'];
  
  return (
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-muted-foreground" />
      <select 
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        className="bg-transparent border-none text-lg font-medium focus:outline-none focus:ring-0"
      >
        {clients.map(client => (
          <option key={client} value={client}>
            {client}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DashboardLayout;
