
import React from "react";
import { useLocation } from "react-router-dom";
import { 
  Building, 
  Calendar, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Calculator,
  Users,
  LineChart
} from "lucide-react";

import { 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

export function AccountantSection() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Contabilidade</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/clients"}>
                <a href="/clients">
                  <Building className="h-4 w-4" />
                  <span>Clientes</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/obrigacoes-fiscais"}>
                <a href="/obrigacoes-fiscais">
                  <Calendar className="h-4 w-4" />
                  <span>Obrigações Fiscais</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/guias-fiscais"}>
                <a href="/guias-fiscais">
                  <FileText className="h-4 w-4" />
                  <span>Guias Fiscais</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/folha-pagamento"}>
                <a href="/folha-pagamento">
                  <CreditCard className="h-4 w-4" />
                  <span>Folha de Pagamento</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/calculos-fiscais"}>
                <a href="/calculos-fiscais">
                  <Calculator className="h-4 w-4" />
                  <span>Cálculos Fiscais</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        <SidebarGroupLabel>Administração</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/colaboradores"}>
                <a href="/colaboradores">
                  <Users className="h-4 w-4" />
                  <span>Colaboradores</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/admin/business-analytics"}>
                <a href="/admin/business-analytics">
                  <BarChart3 className="h-4 w-4" />
                  <span>Análise de Negócio</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={currentPath === "/admin/usage-metrics"}>
                <a href="/admin/usage-metrics">
                  <LineChart className="h-4 w-4" />
                  <span>Métricas de Uso</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
