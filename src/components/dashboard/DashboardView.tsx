
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { ClientSummaryCard } from "@/components/dashboard/ClientSummaryCard";
import { FiscalCalendar } from "@/components/dashboard/FiscalCalendar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DocumentsTable } from "@/components/dashboard/DocumentsTable";
import { ContabilAlerts } from '@/components/alerts/ContabilAlerts';
import { FiscalDeadlineAlerts } from '@/components/alerts/FiscalDeadlineAlerts';
import { BarChart, FileText, DollarSign, Calendar, Building, Inbox, CheckCircle } from "lucide-react";

// Tipos para dados do dashboard
type ClientStatus = 'regular' | 'pendente' | 'atrasado';
type DocumentStatus = 'pendente' | 'recebido' | 'processado' | 'arquivado';
type ObligationStatus = 'pendente' | 'atrasado' | 'concluído';
type PriorityLevel = 'alta' | 'média' | 'baixa';

// Interface para clientes
interface Client {
  name: string;
  status: ClientStatus;
  documentsPending: number;
  upcomingDeadlines: number;
}

// Interface para eventos/obrigações
interface ObligationEvent {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: ObligationStatus;
  priority: PriorityLevel;
}

// Interface para documentos
interface Document {
  id: string;
  name: string;
  client: string;
  type: string;
  date: string;
  status: DocumentStatus;
}

// Dados de exemplo
const clients: Client[] = [
  { name: 'Empresa ABC Ltda', status: 'regular', documentsPending: 2, upcomingDeadlines: 3 },
  { name: 'XYZ Comércio S.A.', status: 'pendente', documentsPending: 5, upcomingDeadlines: 2 },
  { name: 'Tech Solutions', status: 'atrasado', documentsPending: 7, upcomingDeadlines: 4 },
];

const fiscalEvents: ObligationEvent[] = [
  { id: '1', title: 'DARF PIS/COFINS', client: 'Empresa ABC Ltda', dueDate: '25/05/2025', status: 'pendente', priority: 'alta' },
  { id: '2', title: 'DARF IRPJ', client: 'XYZ Comércio S.A.', dueDate: '30/05/2025', status: 'pendente', priority: 'média' },
  { id: '3', title: 'GFIP', client: 'Tech Solutions', dueDate: '20/05/2025', status: 'atrasado', priority: 'alta' },
  { id: '4', title: 'ICMS-ST', client: 'XYZ Comércio S.A.', dueDate: '15/05/2025', status: 'concluído', priority: 'baixa' }
];

const recentDocuments: Document[] = [
  { id: '1', name: 'Balanço Patrimonial', client: 'Empresa ABC Ltda', type: 'Contábil', date: '10/05/2025', status: 'processado' },
  { id: '2', name: 'Notas Fiscais Abril', client: 'XYZ Comércio S.A.', type: 'Fiscal', date: '05/05/2025', status: 'recebido' },
  { id: '3', name: 'Folha de Pagamento', client: 'Tech Solutions', type: 'RH', date: '01/05/2025', status: 'pendente' },
  { id: '4', name: 'Extrato Bancário', client: 'Empresa ABC Ltda', type: 'Financeiro', date: '30/04/2025', status: 'arquivado' },
];

export function DashboardView() {
  const { isAdmin, isAccountant } = useAuth();
  
  // Dashboard para contador (visualização mais completa)
  const renderAccountantDashboard = () => (
    <div className="space-y-6">
      <ContabilAlerts />
      <FiscalDeadlineAlerts />
      
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de Clientes" 
          value="42" 
          icon={<Building className="h-5 w-5" />} 
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Pendentes" 
          value="18" 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 12, isPositive: false }}
        />
        <MetricCard 
          title="Documentos Processados" 
          value="283" 
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard 
          title="Faturamento Mensal" 
          value="R$ 45.780,00" 
          icon={<DollarSign className="h-5 w-5" />} 
          trend={{ value: 15, isPositive: true }}
        />
      </div>
      
      {/* Clientes com pendências */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Clientes com Pendências</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clients.map((client, index) => (
            <ClientSummaryCard
              key={index}
              name={client.name}
              status={client.status}
              documentsPending={client.documentsPending}
              upcomingDeadlines={client.upcomingDeadlines}
            />
          ))}
        </div>
      </div>
      
      {/* Calendário fiscal e documentos recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FiscalCalendar events={fiscalEvents} />
        <DocumentsTable documents={recentDocuments} />
      </div>
    </div>
  );
  
  // Dashboard para cliente (visualização simplificada)
  const renderClientDashboard = () => (
    <div className="space-y-6">
      <FiscalDeadlineAlerts />
      
      {/* Métricas do cliente */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Docs. Pendentes" 
          value="3" 
          icon={<Inbox className="h-5 w-5" />} 
          trend={{ value: 2, isPositive: false }}
        />
        <MetricCard 
          title="Obrigações Pendentes" 
          value="2" 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Docs. Enviados" 
          value="27" 
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Cumpridas" 
          value="15" 
          icon={<CheckCircle className="h-5 w-5" />} 
          trend={{ value: 15, isPositive: true }}
        />
      </div>
      
      {/* Calendário fiscal e documentos recentes para o cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FiscalCalendar events={fiscalEvents.filter(e => e.client === 'Empresa ABC Ltda')} />
        <DocumentsTable documents={recentDocuments.filter(d => d.client === 'Empresa ABC Ltda')} />
      </div>
    </div>
  );
  
  // Dashboard para administrador (visualização completa com foco em métricas da empresa)
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <ContabilAlerts />
      <FiscalDeadlineAlerts />
      
      {/* Métricas do administrador */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de Clientes" 
          value="42" 
          icon={<Building className="h-5 w-5" />} 
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard 
          title="Faturamento Mensal" 
          value="R$ 45.780,00" 
          icon={<DollarSign className="h-5 w-5" />} 
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Atrasadas" 
          value="7" 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 2, isPositive: true }}
        />
        <MetricCard 
          title="Taxa de Conclusão" 
          value="94%" 
          icon={<BarChart className="h-5 w-5" />} 
          trend={{ value: 3, isPositive: true }}
        />
      </div>
      
      {/* Clientes com pendências e calendário fiscal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Clientes com Pendências</h2>
          <div className="space-y-4">
            {clients.map((client, index) => (
              <ClientSummaryCard
                key={index}
                name={client.name}
                status={client.status}
                documentsPending={client.documentsPending}
                upcomingDeadlines={client.upcomingDeadlines}
              />
            ))}
          </div>
        </div>
        <FiscalCalendar events={fiscalEvents} />
      </div>
    </div>
  );
  
  // Renderizar o dashboard adequado baseado no perfil do usuário
  if (isAdmin) {
    return renderAdminDashboard();
  } else if (isAccountant) {
    return renderAccountantDashboard();
  } else {
    // Cliente ou outro tipo de usuário
    return renderClientDashboard();
  }
}
