
import React from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  FileText, 
  FolderOpen, 
  Clock, 
  Building2, 
  Users, 
  Key,
  LineChart,
  Calculator,
  Ban,
  Bell,
  CloudLightning,
  BarChart,
  BrainCircuit,
  Scale,
  Workflow
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function CommonSection() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Dashboard">
          <Link to="/">
            <BarChart3 />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Obrigações Fiscais">
          <Link to="/obrigacoes-fiscais">
            <Clock />
            <span>Obrigações Fiscais</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Guias e Documentos Fiscais">
          <Link to="/guias-fiscais">
            <FileText />
            <span>Guias Fiscais</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Relatórios Financeiros">
          <Link to="/relatorios">
            <LineChart />
            <span>Relatórios Financeiros</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Análises Preditivas">
          <Link to="/analises-preditivas">
            <BrainCircuit />
            <span>Análises Preditivas</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Relatórios IA">
          <Link to="/relatorios-ia">
            <BarChart />
            <span>Relatórios IA</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Folha de Pagamento">
          <Link to="/folha-pagamento">
            <FileText />
            <span>Folha de Pagamento</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Apuração Automática">
          <Link to="/apuracao-automatica">
            <Workflow />
            <span>Apuração Automática</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Cálculos Fiscais">
          <Link to="/calculos-fiscais">
            <Calculator />
            <span>Cálculos Fiscais</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Regime Fiscal">
          <Link to="/regime-fiscal">
            <Scale />
            <span>Regime Fiscal</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Automação Bancária">
          <Link to="/automacao-bancaria">
            <Ban />
            <span>Automação Bancária</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Gerenciar Clientes">
          <Link to="/clientes">
            <Building2 />
            <span>Gerenciar Clientes</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Colaboradores">
          <Link to="/colaboradores">
            <Users />
            <span>Colaboradores</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Acesso de Clientes">
          <Link to="/client-access">
            <Key />
            <span>Acesso de Clientes</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Documentos">
          <Link to="/documentos">
            <FolderOpen />
            <span>Documentos</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Notificações">
          <Link to="/notifications">
            <Bell />
            <span>Notificações</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Integrações Gov">
          <Link to="/integracoes-gov">
            <CloudLightning />
            <span>Integrações Gov</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Integrações Estaduais">
          <Link to="/integracoes-estaduais">
            <CloudLightning />
            <span>Integrações Estaduais</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}
