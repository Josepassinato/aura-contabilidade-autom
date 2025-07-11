import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Download, Eye, Filter, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  client_id: string;
  client_name?: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

const AccountantDocuments = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");

  useEffect(() => {
    loadClients();
    loadDocuments();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('accounting_clients')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Erro ao carregar clientes:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('client_documents')
        .select(`
          id,
          name,
          type,
          status,
          client_id,
          created_at,
          accounting_clients!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (selectedClient !== "all") {
        query = query.eq('client_id', selectedClient);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar documentos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar documentos",
          variant: "destructive",
        });
        return;
      }

      const formattedDocs = data?.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        status: doc.status,
        client_id: doc.client_id,
        client_name: doc.accounting_clients?.name,
        created_at: doc.created_at
      })) || [];

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      // Implementar visualização do documento
      toast({
        title: "Visualizar Documento",
        description: "Funcionalidade de visualização será implementada",
      });
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao visualizar documento",
        variant: "destructive",
      });
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('client_documents')
        .update({ status: 'processado' })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      toast({
        title: "Documento Aprovado",
        description: "O documento foi aprovado com sucesso",
      });

      loadDocuments();
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar documento",
        variant: "destructive",
      });
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('client_documents')
        .update({ status: 'rejeitado' })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      toast({
        title: "Documento Rejeitado",
        description: "O documento foi rejeitado",
      });

      loadDocuments();
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar documento",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Documentos dos Clientes</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie documentos de todos os seus clientes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredDocuments.length} documentos
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por documento, cliente ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum documento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Cliente: {doc.client_name}</span>
                          <span>Tipo: {doc.type}</span>
                          <span>
                            Enviado: {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {doc.status === 'pendente' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveDocument(doc.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectDocument(doc.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccountantDocuments;