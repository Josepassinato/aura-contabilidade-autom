
import React from 'react';
import { ClientSummaryCard } from './ClientSummaryCard';
import { FiscalCalendar } from './FiscalCalendar';
import { DocumentsTable } from './DocumentsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';

export const DashboardView = () => {
  const { enhancedLogout } = useAuth();
  
  // Mock data for events
  const mockEvents = [
    {
      id: '1', 
      title: 'Entrega SPED Fiscal', 
      client: 'Tech Solutions Ltda',
      dueDate: '25/05/2025',
      status: 'pendente' as const,
      priority: 'alta' as const,
    },
    {
      id: '2', 
      title: 'Pagamento ICMS', 
      client: 'Comércio Online SA',
      dueDate: '27/05/2025',
      status: 'pendente' as const,
      priority: 'média' as const,
    },
    {
      id: '3', 
      title: 'Declaração IR', 
      client: 'Consultoria XYZ',
      dueDate: '30/05/2025',
      status: 'atrasado' as const,
      priority: 'alta' as const,
    }
  ];

  // Mock data for documents
  const mockDocuments = [
    {
      id: '1',
      name: 'Nota Fiscal #78923',
      client: 'Comércio Online SA',
      type: 'NF-e',
      status: 'pendente' as const,
      date: '19/05/2025',
    },
    {
      id: '2',
      name: 'Extrato Bancário',
      client: 'Tech Solutions Ltda',
      type: 'Financeiro',
      status: 'recebido' as const,
      date: '18/05/2025',
    },
    {
      id: '3',
      name: 'Folha de Pagamento',
      client: 'Consultoria XYZ',
      type: 'RH',
      status: 'processado' as const,
      date: '17/05/2025',
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton />
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center"
              onClick={enhancedLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus clientes e obrigações fiscais
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ClientSummaryCard
          name="Total de Clientes"
          status="regular"
          documentsPending={2}
          upcomingDeadlines={6}
        />
        <ClientSummaryCard
          name="Obrigações Fiscais"
          status="pendente"
          documentsPending={12}
          upcomingDeadlines={3}
        />
        <ClientSummaryCard
          name="Documentos"
          status="regular"
          documentsPending={54}
          upcomingDeadlines={0}
        />
        <ClientSummaryCard
          name="Economias Fiscais"
          status="regular"
          documentsPending={0}
          upcomingDeadlines={18}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Calendário Fiscal</CardTitle>
            <CardDescription>
              Próximas obrigações e eventos fiscais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FiscalCalendar events={mockEvents} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Documentos Recentes</CardTitle>
            <CardDescription>
              Últimos documentos enviados pelos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentsTable documents={mockDocuments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
