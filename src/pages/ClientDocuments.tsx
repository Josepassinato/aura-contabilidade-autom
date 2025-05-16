
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DocumentList } from '@/components/client-portal/documents/DocumentList';
import { DocumentSearch } from '@/components/client-portal/documents/DocumentSearch';
import { DocumentTabs } from '@/components/client-portal/documents/DocumentTabs';
import { useClientDocuments } from '@/components/client-portal/useClientDocuments'; // Fixed the import path

const ClientDocuments = () => {
  const {
    documents,
    isLoading,
    activeTab,
    searchQuery,
    selectedTags,
    handleTabChange,
    handleSearch,
    handleTagSelect,
    handleDeleteDocument,
    refreshDocuments
  } = useClientDocuments();

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
          searchQuery={searchQuery}
          onSearch={handleSearch}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
        />
        
        <DocumentTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <DocumentList
          documents={documents}
          isLoading={isLoading}
          onDelete={handleDeleteDocument}
          onRefresh={refreshDocuments}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientDocuments;
