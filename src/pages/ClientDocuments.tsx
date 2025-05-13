
import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-portal/ClientHeader";
import { DocumentUpload } from "@/components/client-portal/DocumentUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentSearch } from "@/components/client-portal/documents/DocumentSearch";
import { DocumentTabs } from "@/components/client-portal/documents/DocumentTabs";
import { useClientDocuments } from "@/components/client-portal/documents/useClientDocuments";

const ClientDocuments = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [clientInfo, setClientInfo] = useState<{ id: string; name: string; cnpj: string } | null>(null);
  
  useEffect(() => {
    // Verificar se o cliente está autenticado
    const clientId = sessionStorage.getItem('client_id');
    const clientName = sessionStorage.getItem('client_name');
    const clientCnpj = sessionStorage.getItem('client_cnpj');
    
    if (clientId && clientName && clientCnpj) {
      setClientInfo({ id: clientId, name: clientName, cnpj: clientCnpj });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const {
    documents,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleViewDocument,
    loadDocuments
  } = useClientDocuments(clientInfo?.id || null);

  const handleLogout = () => {
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    setIsAuthenticated(false);
  };

  const handleUploadComplete = () => {
    // Recarregar a lista de documentos após upload bem-sucedido
    if (clientInfo?.id) {
      loadDocuments(clientInfo.id);
    }
  };

  if (isAuthenticated === null || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (isAuthenticated === false) {
    return <Navigate to="/client-access" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ClientHeader 
        clientName={clientInfo?.name || "Cliente"} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Documentos</h1>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link to="/client-portal">
                  Voltar ao Portal
                </Link>
              </Button>
              <DocumentUpload 
                clientId={clientInfo?.id || ""} 
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Seus Documentos</CardTitle>
                <DocumentSearch 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTabs 
                documents={documents}
                onViewDocument={handleViewDocument}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientDocuments;
