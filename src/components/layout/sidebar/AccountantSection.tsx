
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { CircleDollarSign, FileSpreadsheet, Calculator, CalendarDays, FileText, Network, Users, Layers, FileBarChart2, CoinsIcon, BriefcaseIcon, Settings, Activity, Calendar, TestTubeIcon, Settings2Icon, Bot, BarChart } from 'lucide-react';
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
            <SidebarMenuButton asChild isActive={isActive('/parametros-fiscais')}>
              <Link to="/parametros-fiscais">
                <Settings className="h-4 w-4 mr-2" />
                <span>Parâmetros Fiscais</span>
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
            <SidebarMenuButton asChild isActive={isActive('/regime-fiscal')}>
              <Link to="/regime-fiscal">
                <CoinsIcon className="h-4 w-4 mr-2" />
                <span>Regime Tributário</span>
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
            <SidebarMenuButton asChild isActive={isActive('/guias-fiscais')}>
              <Link to="/guias-fiscais">
                <FileBarChart2 className="h-4 w-4 mr-2" />
                <span>Guias Fiscais</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/apuracao-automatica')}>
              <Link to="/apuracao-automatica">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                <span>Apuração Automática</span>
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
            <SidebarMenuButton asChild isActive={isActive('/workflow-dashboard')}>
              <Link to="/workflow-dashboard">
                <Activity className="h-4 w-4 mr-2" />
                <span>Dashboard de Problemas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/fechamento-mensal')}>
              <Link to="/fechamento-mensal">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Fechamento Mensal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/task-automation')}>
              <Link to="/task-automation">
                <Bot className="h-4 w-4 mr-2" />
                <span>Motor de Automação</span>
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/agente-voz')}>
              <Link to="/agente-voz">
                <Settings2Icon className="h-4 w-4 mr-2" />
                <span>Agente de Voz</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/auditoria-inteligente')}>
              <Link to="/auditoria-inteligente">
                <Settings2Icon className="h-4 w-4 mr-2" />
                <span>Auditoria Inteligente</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dados-teste')}>
              <Link to="/dados-teste">
                <TestTubeIcon className="h-4 w-4 mr-2" />
                <span>Dados de Teste</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/contabilidade')}>
              <Link to="/contabilidade">
                <Calculator className="h-4 w-4 mr-2" />
                <span>Módulo Contábil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/analises-preditivas')}>
              <Link to="/analises-preditivas">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                <span>Análises Preditivas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/auditoria-continua')}>
              <Link to="/auditoria-continua">
                <Settings2Icon className="h-4 w-4 mr-2" />
                <span>Auditoria Contínua</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/business-intelligence')}>
              <Link to="/business-intelligence">
                <BarChart className="h-4 w-4 mr-2" />
                <span>Business Intelligence</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/automacao-bancaria')}>
              <Link to="/automacao-bancaria">
                <CoinsIcon className="h-4 w-4 mr-2" />
                <span>Automação Bancária</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/monitor-anomalias')}>
              <Link to="/monitor-anomalias">
                <Activity className="h-4 w-4 mr-2" />
                <span>Monitor de Anomalias</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/colaboradores')}>
              <Link to="/colaboradores">
                <Users className="h-4 w-4 mr-2" />
                <span>Colaboradores</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')}>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
