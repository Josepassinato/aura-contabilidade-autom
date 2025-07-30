
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Documents } from './Documents';
import { DocumentUpload } from './DocumentUpload';
import { TaxObligations } from './TaxObligations';
import { ExternalIntegrations } from './ExternalIntegrations';
import { FinancialSummary } from './FinancialSummary';
import { ClientDashboard } from './ClientDashboard';
import { ClientMessages } from './ClientMessages';
import { TransactionHistory } from './TransactionHistory';
import { useAuth } from '@/contexts/auth';

interface ClientPortalTabsProps {
  toggleAssistant?: () => void;
}

export const ClientPortalTabs = ({ toggleAssistant }: ClientPortalTabsProps) => {
  const { isClient } = useAuth();
  // Get clientId from session storage
  const clientId = sessionStorage.getItem('client_id') || '';
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="obligations">Obrigações</TabsTrigger>
          {!isClient && <TabsTrigger value="integrations">Integrações</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <ClientDashboard clientId={clientId} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionHistory clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Documents clientId={clientId} />
          {!isClient && (
            <div className="mt-6">
              <DocumentUpload clientId={clientId} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <ClientMessages clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="obligations" className="space-y-4">
          <TaxObligations clientId={clientId} />
        </TabsContent>
        
        {!isClient && (
          <TabsContent value="integrations" className="space-y-4">
            <ExternalIntegrations clientId={clientId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
