
import React from 'react';
import { Link } from 'react-router-dom';
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
  Mic,
  Database,
  Calculator
} from "lucide-react";

interface SidebarProps {
  isVoiceActive: boolean;
  toggleVoiceAssistant: () => void;
}

export function DashboardSidebar({ isVoiceActive, toggleVoiceAssistant }: SidebarProps) {
  return (
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
                <SidebarMenuButton tooltip="Dashboard" asChild isActive={window.location.pathname === "/"}>
                  <Link to="/">
                    <BarChart className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Gerenciar Clientes" asChild isActive={window.location.pathname === "/clientes"}>
                  <Link to="/clientes">
                    <Building className="h-5 w-5" />
                    <span>Clientes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Obrigações Fiscais" asChild isActive={window.location.pathname === "/obrigacoes-fiscais"}>
                  <Link to="/obrigacoes-fiscais">
                    <Calendar className="h-5 w-5" />
                    <span>Obrigações Fiscais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Apuração Automática" asChild isActive={window.location.pathname === "/apuracao-automatica"}>
                  <Link to="/apuracao-automatica">
                    <Calculator className="h-5 w-5" />
                    <span>Apuração Automática</span>
                  </Link>
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

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="API e Conexões" asChild isActive={window.location.pathname === "/settings"}>
                  <Link to="/settings">
                    <Database className="h-5 w-5" />
                    <span>API e Conexões</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-2">
          <SidebarMenuButton asChild>
            <Link to="/settings">
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton>
            <HelpCircle className="h-5 w-5" />
            <span>Ajuda</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
