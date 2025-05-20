
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Documents } from './Documents';
import { DocumentUpload } from './DocumentUpload';
import { TaxObligations } from './TaxObligations';
import { ExternalIntegrations } from './ExternalIntegrations';
import { FinancialSummary } from './FinancialSummary';

interface ClientPortalTabsProps {
  toggleAssistant?: () => void;
}

export const ClientPortalTabs = ({ toggleAssistant }: ClientPortalTabsProps) => {
  // Get clientId from session storage
  const clientId = sessionStorage.getItem('client_id') || '';
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="obligations">Obrigações Fiscais</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <FinancialSummary clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Documents clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <DocumentUpload clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="obligations" className="space-y-4">
          <TaxObligations clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <ExternalIntegrations clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
