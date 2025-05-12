
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { ClientSummaryCard } from "@/components/dashboard/ClientSummaryCard";
import { FiscalCalendar } from "@/components/dashboard/FiscalCalendar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DocumentsTable } from "@/components/dashboard/DocumentsTable";
import { ContabilAlerts } from '@/components/alerts/ContabilAlerts';
import { FiscalDeadlineAlerts } from '@/components/alerts/FiscalDeadlineAlerts';
import { BarChart, FileText, DollarSign, Calendar, Building, Inbox, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { fetchObrigacoesFiscais } from '@/services/supabase/obrigacoesService';
import { fetchClientDocuments } from '@/services/supabase/documentosService';

export function DashboardView() {
  const { isAdmin, isAccountant } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [fiscalEvents, setFiscalEvents] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteAtivo, setClienteAtivo] = useState<string | null>(null);
  
  // Carregar dados reais do Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carregar clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from('accounting_clients')
          .select('*');
          
        if (!clientesError && clientesData) {
          setClientes(clientesData.map(cliente => ({
            name: cliente.name,
            status: 'regular' as 'regular' | 'pendente' | 'atrasado',
            documentsPending: 0,
            upcomingDeadlines: 0,
            id: cliente.id
          })));
          
          // Se tiver clientes, define o primeiro como ativo
          if (clientesData.length > 0) {
            setClienteAtivo(clientesData[0].id);
          }
        } else {
          setClientes([]);
        }
        
        // Carregar obrigações fiscais
        const obrigacoesFiscais = await fetchObrigacoesFiscais();
        setFiscalEvents(obrigacoesFiscais.map(obr => ({
          id: obr.id?.toString() || '',
          title: obr.nome || '',
          client: obr.empresa || '',
          dueDate: obr.prazo || '',
          status: obr.status || 'pendente',
          priority: obr.prioridade || 'media'
        })));
        
        // Carregar documentos recentes
        if (clienteAtivo) {
          const documentos = await fetchClientDocuments(clienteAtivo, 4);
          setRecentDocuments(documentos.map(doc => ({
            id: doc.id || '',
            name: doc.title || '',
            client: clientesData?.find(c => c.id === clienteAtivo)?.name || '',
            type: doc.type || '',
            date: doc.date || '',
            // Garante que o status seja explicitamente "processado" ou definido como "pendente" por padrão
            status: doc.status === 'processado' ? 'processado' : 'pendente'
          })));
        } else {
          setRecentDocuments([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [clienteAtivo]);
  
  // Dashboard para contador (visualização mais completa)
  const renderAccountantDashboard = () => (
    <div className="space-y-6">
      <ContabilAlerts />
      <FiscalDeadlineAlerts />
      
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de Clientes" 
          value={clientes.length.toString()} 
          icon={<Building className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Pendentes" 
          value={fiscalEvents.filter(e => e.status === 'pendente').length.toString()} 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Documentos Processados" 
          value={recentDocuments.filter(d => d.status === 'processado').length.toString()} 
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Faturamento Mensal" 
          value="R$ 0,00" 
          icon={<DollarSign className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      {/* Clientes com pendências */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Clientes</h2>
        {loading ? (
          <p>Carregando clientes...</p>
        ) : clientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientes.map((client, index) => (
              <ClientSummaryCard
                key={index}
                name={client.name}
                status={client.status}
                documentsPending={client.documentsPending}
                upcomingDeadlines={client.upcomingDeadlines}
              />
            ))}
          </div>
        ) : (
          <p>Nenhum cliente cadastrado</p>
        )}
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
          value="0" 
          icon={<Inbox className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Pendentes" 
          value="0" 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Docs. Enviados" 
          value="0" 
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Cumpridas" 
          value="0" 
          icon={<CheckCircle className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      {/* Calendário fiscal e documentos recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FiscalCalendar events={[]} />
        <DocumentsTable documents={[]} />
      </div>
    </div>
  );
  
  // Dashboard para administrador
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <ContabilAlerts />
      <FiscalDeadlineAlerts />
      
      {/* Métricas do administrador */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de Clientes" 
          value={clientes.length.toString()} 
          icon={<Building className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Faturamento Mensal" 
          value="R$ 0,00" 
          icon={<DollarSign className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Obrigações Atrasadas" 
          value={fiscalEvents.filter(e => e.status === 'atrasado').length.toString()} 
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard 
          title="Taxa de Conclusão" 
          value="0%" 
          icon={<BarChart className="h-5 w-5" />} 
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      {/* Clientes e calendário fiscal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Clientes</h2>
          {loading ? (
            <p>Carregando clientes...</p>
          ) : clientes.length > 0 ? (
            <div className="space-y-4">
              {clientes.map((client, index) => (
                <ClientSummaryCard
                  key={index}
                  name={client.name}
                  status={client.status}
                  documentsPending={client.documentsPending}
                  upcomingDeadlines={client.upcomingDeadlines}
                />
              ))}
            </div>
          ) : (
            <p>Nenhum cliente cadastrado</p>
          )}
        </div>
        <FiscalCalendar events={fiscalEvents} />
      </div>
    </div>
  );
  
  if (loading) {
    return <div>Carregando dados...</div>;
  }
  
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
