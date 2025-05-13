
import React from 'react';
import { 
  BarChart4, Users, FileText, Calendar, Calculator, 
  FileSpreadsheet, Building2, BadgePercent, Receipt, 
  CreditCard, Activity, PieChart, Lock, Building
} from 'lucide-react';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { useAuth } from '@/contexts/auth';
import { Separator } from '@/components/ui/separator';

export function AccountantSection() {
  const { isAdmin, isAccountant } = useAuth();

  // If not admin or accountant, don't show this section
  if (!isAdmin && !isAccountant) {
    return null;
  }

  return (
    <>
      <div className="px-4 my-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          Contabilidade
        </h2>
        <div className="space-y-1">
          {isAccountant && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Guias Fiscais">
                <a href="/dashboard/guias-fiscais">
                  <FileText />
                  <span>Guias Fiscais</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {isAccountant && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Obrigações Fiscais">
                <a href="/dashboard/obrigacoes-fiscais">
                  <Calendar />
                  <span>Obrigações Fiscais</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Regime Fiscal">
              <a href="/dashboard/regime-fiscal">
                <BadgePercent />
                <span>Regime Fiscal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cálculos Fiscais">
              <a href="/dashboard/calculos-fiscais">
                <Calculator />
                <span>Cálculos Fiscais</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isAccountant && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Apuração Automática">
                <a href="/dashboard/apuracao-automatica">
                  <Receipt />
                  <span>Apuração Automática</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Folha de Pagamento">
              <a href="/dashboard/folha-pagamento">
                <Users />
                <span>Folha de Pagamento</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Relatórios Financeiros">
              <a href="/dashboard/relatorios-financeiros">
                <FileSpreadsheet />
                <span>Relatórios Financeiros</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      {/* Gestão section */}
      <div className="px-4 my-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          Gestão
        </h2>
        <div className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Clientes">
              <a href="/dashboard/gerenciar-clientes">
                <Building2 />
                <span>Clientes</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isAccountant && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Automação Bancária">
                <a href="/dashboard/automacao-bancaria">
                  <CreditCard />
                  <span>Automação Bancária</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {isAccountant && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Acesso de Clientes">
                <a href="/dashboard/client-access">
                  <Lock />
                  <span>Acesso de Clientes</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Colaboradores">
                <a href="/dashboard/colaboradores">
                  <Users />
                  <span>Colaboradores</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </div>
      </div>
      
      <Separator className="my-2" />
      
      {/* Analytics section */}
      <div className="px-4 my-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          Analytics
        </h2>
        <div className="space-y-1">
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Indicadores de Negócio">
                <a href="/dashboard/admin/business-analytics">
                  <BarChart4 />
                  <span>Indicadores de Negócio</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Análises Preditivas">
              <a href="/dashboard/analises-preditivas">
                <Activity />
                <span>Análises Preditivas</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="IA Insights">
              <a href="/dashboard/relatorios-ia">
                <PieChart />
                <span>IA Insights</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </div>
    </>
  );
}
