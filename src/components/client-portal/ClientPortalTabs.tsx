
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Documents } from './Documents';
import { DocumentUpload } from './DocumentUpload';
import { TaxObligations } from './TaxObligations';
import { ExternalIntegrations } from './ExternalIntegrations';
import { FinancialSummary } from './FinancialSummary';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';

interface ClientPortalTabsProps {
  toggleAssistant?: () => void;
}

export const ClientPortalTabs = ({ toggleAssistant }: ClientPortalTabsProps) => {
  const { enhancedLogout } = useAuth();
  // Get clientId from session storage
  const clientId = sessionStorage.getItem('client_id') || '';
  
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
          <h1 className="text-3xl font-bold tracking-tight">Portal do Cliente</h1>
          <p className="text-muted-foreground">
            Acesse suas informações e documentos em um só lugar
          </p>
        </div>
      </div>

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
