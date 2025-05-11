
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSummaryCard } from "@/components/dashboard/ClientSummaryCard";
import { FiscalCalendar } from "@/components/dashboard/FiscalCalendar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DocumentsTable } from "@/components/dashboard/DocumentsTable";
import { VoiceAssistant } from "@/components/dashboard/VoiceAssistant";
import { BarChart, FileText, DollarSign, Calendar, Building } from "lucide-react";

// Tipos de dados para os componentes
type ClientStatus = 'regular' | 'pendente' | 'atrasado';
type DocumentStatus = 'pendente' | 'recebido' | 'processado' | 'arquivado';
type ObligationStatus = 'pendente' | 'atrasado' | 'concluído';
type PriorityLevel = 'alta' | 'média' | 'baixa';

interface Client {
  name: string;
  status: ClientStatus;
  documentsPending: number;
  upcomingDeadlines: number;
}

interface ObligationEvent {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: ObligationStatus;
  priority: PriorityLevel;
}

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

const Index = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
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
        
        {/* Clientes com status de atenção */}
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
      
      {/* Componente do assistente de voz */}
      {isVoiceActive && (
        <VoiceAssistant isActive={isVoiceActive} onToggle={toggleVoiceAssistant} />
      )}
    </DashboardLayout>
  );
};

export default Index;
