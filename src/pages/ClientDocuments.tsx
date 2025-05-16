
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DocumentList } from '@/components/client-portal/documents/DocumentList';
import { DocumentSearch } from '@/components/client-portal/documents/DocumentSearch';
import { DocumentTabs } from '@/components/client-portal/documents/DocumentTabs';
import { useClientDocuments } from '@/components/client-portal/useClientDocuments';

const ClientDocuments = () => {
  // Get client ID from session storage or use a default
  const clientId = sessionStorage.getItem('client_id') || '';
  const {
    documents,
    searchTerm, 
    setSearchTerm,
    isLoading,
    handleViewDocument,
    loadDocuments
  } = useClientDocuments(clientId);

  // Define handlers based on the hook properties
  const handleDeleteDocument = async (documentId: string) => {
    console.log('Delete document', documentId);
    // Implementation would be here in a real app
    await loadDocuments(clientId);
  };

  const refreshDocuments = () => {
    loadDocuments(clientId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os documentos da sua empresa
          </p>
        </div>

        <DocumentSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <DocumentTabs />

        <DocumentList
          documents={documents}
          onView={handleViewDocument}
          onDelete={handleDeleteDocument}
          onRefresh={refreshDocuments}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientDocuments;
