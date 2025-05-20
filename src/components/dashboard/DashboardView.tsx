
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
          title="Total de Clientes"
          value="32"
          description="+2 novos este mês"
          trend="up"
          trendValue="6.2%"
        />
        <ClientSummaryCard
          title="Obrigações Fiscais"
          value="28"
          description="12 pendentes este mês"
          trend="down"
          trendValue="3.1%"
        />
        <ClientSummaryCard
          title="Documentos"
          value="143"
          description="54 pendentes de análise"
          trend="up"
          trendValue="12.5%"
        />
        <ClientSummaryCard
          title="Economias Fiscais"
          value="R$ 28.300"
          description="Nos últimos 30 dias"
          trend="up"
          trendValue="18.2%"
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
            <FiscalCalendar />
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
            <DocumentsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
