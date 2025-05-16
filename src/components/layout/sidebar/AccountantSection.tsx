
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { CircleDollarSign, FileSpreadsheet, Calculator, CalendarDays, FileText, Network, Users, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function AccountantSection() {
  const location = useLocation();
  
  // Helper to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Área do Contador
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/clientes')}>
              <Link to="/clientes">
                <Users className="h-4 w-4 mr-2" />
                <span>Gerenciar Clientes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/relatorios')}>
              <Link to="/relatorios">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span>Relatórios Financeiros</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/calculos-fiscais')}>
              <Link to="/calculos-fiscais">
                <Calculator className="h-4 w-4 mr-2" />
                <span>Cálculos Fiscais</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/classificacao-reconciliacao')}>
              <Link to="/classificacao-reconciliacao">
                <Layers className="h-4 w-4 mr-2" />
                <span>Classificação e Reconciliação</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/obrigacoes-fiscais')}>
              <Link to="/obrigacoes-fiscais">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>Obrigações Fiscais</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/folha-pagamento')}>
              <Link to="/folha-pagamento">
                <CircleDollarSign className="h-4 w-4 mr-2" />
                <span>Folha de Pagamento</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/integracoes-gov')}>
              <Link to="/integracoes-gov">
                <Network className="h-4 w-4 mr-2" />
                <span>Integrações Governamentais</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/documentos')}>
              <Link to="/documentos">
                <FileText className="h-4 w-4 mr-2" />
                <span>Documentos dos Clientes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
