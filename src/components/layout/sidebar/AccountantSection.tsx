
import React from 'react';
import { 
  BarChart4, Users, FileText, Calendar, Calculator, 
  FileSpreadsheet, Building2, BadgePercent, Receipt, 
  CreditCard, Activity, PieChart, Lock, Building
} from 'lucide-react';
import { SidebarItem } from "@/components/ui/sidebar";
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
            <SidebarItem icon={<FileText />} href="/dashboard/guias-fiscais">
              Guias Fiscais
            </SidebarItem>
          )}
          
          {isAccountant && (
            <SidebarItem icon={<Calendar />} href="/dashboard/obrigacoes-fiscais">
              Obrigações Fiscais
            </SidebarItem>
          )}
          
          <SidebarItem icon={<BadgePercent />} href="/dashboard/regime-fiscal">
            Regime Fiscal
          </SidebarItem>
          
          <SidebarItem icon={<Calculator />} href="/dashboard/calculos-fiscais">
            Cálculos Fiscais
          </SidebarItem>
          
          {isAccountant && (
            <SidebarItem icon={<Receipt />} href="/dashboard/apuracao-automatica">
              Apuração Automática
            </SidebarItem>
          )}
          
          <SidebarItem icon={<Users />} href="/dashboard/folha-pagamento">
            Folha de Pagamento
          </SidebarItem>
          
          <SidebarItem icon={<FileSpreadsheet />} href="/dashboard/relatorios-financeiros">
            Relatórios Financeiros
          </SidebarItem>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      {/* Gestão section */}
      <div className="px-4 my-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          Gestão
        </h2>
        <div className="space-y-1">
          <SidebarItem icon={<Building2 />} href="/dashboard/gerenciar-clientes">
            Clientes
          </SidebarItem>
          
          {isAccountant && (
            <SidebarItem icon={<CreditCard />} href="/dashboard/automacao-bancaria">
              Automação Bancária
            </SidebarItem>
          )}
          
          {isAccountant && (
            <SidebarItem icon={<Lock />} href="/dashboard/client-access">
              Acesso de Clientes
            </SidebarItem>
          )}
          
          {isAdmin && (
            <SidebarItem icon={<Users />} href="/dashboard/colaboradores">
              Colaboradores
            </SidebarItem>
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
            <SidebarItem icon={<BarChart4 />} href="/dashboard/admin/business-analytics">
              Indicadores de Negócio
            </SidebarItem>
          )}
          
          <SidebarItem icon={<Activity />} href="/dashboard/analises-preditivas">
            Análises Preditivas
          </SidebarItem>
          
          <SidebarItem icon={<PieChart />} href="/dashboard/relatorios-ia">
            IA Insights
          </SidebarItem>
        </div>
      </div>
    </>
  );
}
