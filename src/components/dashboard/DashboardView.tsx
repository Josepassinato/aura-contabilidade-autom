
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
  
  // Arrays vazios - sem dados simulados
  const mockEvents: any[] = [];
  const mockDocuments: any[] = [];
  
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
          documentsPending={0}
          upcomingDeadlines={0}
        />
        <ClientSummaryCard
          name="Obrigações Fiscais"
          status="regular"
          documentsPending={0}
          upcomingDeadlines={0}
        />
        <ClientSummaryCard
          name="Documentos"
          status="regular"
          documentsPending={0}
          upcomingDeadlines={0}
        />
        <ClientSummaryCard
          name="Economias Fiscais"
          status="regular"
          documentsPending={0}
          upcomingDeadlines={0}
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
            {mockEvents.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Nenhum evento cadastrado
              </div>
            ) : (
              <FiscalCalendar events={mockEvents} />
            )}
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
            {mockDocuments.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Nenhum documento recente
              </div>
            ) : (
              <DocumentsTable documents={mockDocuments} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
