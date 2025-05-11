
import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-portal/ClientHeader";
import { DocumentUpload } from "@/components/client-portal/DocumentUpload";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'pendente' | 'processado' | 'rejeitado';
  url?: string;
  file_path?: string;
}

const ClientDocuments = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [clientInfo, setClientInfo] = useState<{ id: string; name: string; cnpj: string } | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  useEffect(() => {
    // Verificar se o cliente está autenticado
    const clientId = sessionStorage.getItem('client_id');
    const clientName = sessionStorage.getItem('client_name');
    const clientCnpj = sessionStorage.getItem('client_cnpj');
    
    if (clientId && clientName && clientCnpj) {
      setClientInfo({ id: clientId, name: clientName, cnpj: clientCnpj });
      setIsAuthenticated(true);
      loadDocuments(clientId);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const loadDocuments = async (clientId: string) => {
    setIsLoading(true);
    
    try {
      if (supabase) {
        // Buscar documentos do cliente no Supabase
        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId)
          .order('uploaded_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: formatFileSize(doc.size || 0),
            date: new Date(doc.uploaded_at).toLocaleDateString('pt-BR'),
            status: doc.status,
            file_path: doc.file_path
          }));
          
          setDocuments(formattedDocs);
        }
      } else {
        // Fallback para dados mockados quando o Supabase não está disponível
        const mockDocuments: Document[] = [
          { id: '1', name: 'NFe-2025-001245.pdf', type: 'nota-fiscal', size: '420 KB', date: '15/05/2025', status: 'processado' },
          { id: '2', name: 'Recibo-Aluguel-Maio.pdf', type: 'recibo', size: '180 KB', date: '10/05/2025', status: 'processado' },
          { id: '3', name: 'Extrato-BancoXYZ-Maio.pdf', type: 'extrato', size: '310 KB', date: '05/05/2025', status: 'pendente' },
          { id: '4', name: 'Contrato-Prestacao-Servicos.pdf', type: 'contrato', size: '1.2 MB', date: '01/05/2025', status: 'processado' },
          { id: '5', name: 'NFe-2025-001189.pdf', type: 'nota-fiscal', size: '390 KB', date: '28/04/2025', status: 'processado' },
          { id: '6', name: 'Folha-Pagamento-Abril.pdf', type: 'outro', size: '280 KB', date: '25/04/2025', status: 'rejeitado' },
        ];
        
        setDocuments(mockDocuments);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Não foi possível carregar a lista de documentos. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    setIsAuthenticated(false);
    
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do portal do cliente",
    });
  };

  const handleUploadComplete = () => {
    // Recarregar a lista de documentos após upload bem-sucedido
    if (clientInfo?.id) {
      loadDocuments(clientInfo.id);
    }
  };

  const handleViewDocument = async (document: Document) => {
    if (!document.file_path || !supabase) {
      toast({
        title: "Erro ao visualizar documento",
        description: "Não foi possível acessar este documento.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(document.file_path, 60); // URL válida por 60 segundos
        
      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error("Erro ao obter URL do documento:", error);
      toast({
        title: "Erro ao visualizar documento",
        description: "Não foi possível acessar este documento. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filtrar documentos com base no termo de pesquisa
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todos">
                <TabsList>
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="nota-fiscal">Notas Fiscais</TabsTrigger>
                  <TabsTrigger value="recibo">Recibos</TabsTrigger>
                  <TabsTrigger value="contrato">Contratos</TabsTrigger>
                  <TabsTrigger value="outro">Outros</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="todos">
                    <DocumentList 
                      documents={filteredDocuments} 
                      onViewDocument={handleViewDocument} 
                    />
                  </TabsContent>
                  <TabsContent value="nota-fiscal">
                    <DocumentList 
                      documents={filteredDocuments.filter(doc => doc.type === 'nota-fiscal')}
                      onViewDocument={handleViewDocument} 
                    />
                  </TabsContent>
                  <TabsContent value="recibo">
                    <DocumentList 
                      documents={filteredDocuments.filter(doc => doc.type === 'recibo')}
                      onViewDocument={handleViewDocument} 
                    />
                  </TabsContent>
                  <TabsContent value="contrato">
                    <DocumentList 
                      documents={filteredDocuments.filter(doc => doc.type === 'contrato')}
                      onViewDocument={handleViewDocument} 
                    />
                  </TabsContent>
                  <TabsContent value="outro">
                    <DocumentList 
                      documents={filteredDocuments.filter(doc => doc.type === 'outro' || doc.type === 'extrato')}
                      onViewDocument={handleViewDocument} 
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Componente para exibir a lista de documentos
interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
}

const DocumentList = ({ documents, onViewDocument }: DocumentListProps) => {
  const statusBadgeStyle = (status: string) => {
    switch (status) {
      case 'processado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-300" />
        <p className="mt-2 text-lg font-medium text-gray-500">Nenhum documento encontrado</p>
        <p className="text-sm text-gray-400">Utilize o botão "Enviar Documentos" para adicionar</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="grid grid-cols-12 bg-muted px-4 py-3 rounded-t-md">
        <div className="col-span-5 font-medium text-sm">Nome do Arquivo</div>
        <div className="col-span-2 font-medium text-sm">Tipo</div>
        <div className="col-span-2 font-medium text-sm">Data</div>
        <div className="col-span-2 font-medium text-sm">Status</div>
        <div className="col-span-1 font-medium text-sm text-right">Ações</div>
      </div>
      <div className="divide-y">
        {documents.map((doc) => (
          <div key={doc.id} className="grid grid-cols-12 px-4 py-3 items-center">
            <div className="col-span-5 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.size}</p>
              </div>
            </div>
            <div className="col-span-2 text-sm">{doc.type}</div>
            <div className="col-span-2 text-sm">{doc.date}</div>
            <div className="col-span-2">
              <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeStyle(doc.status)}`}>
                {doc.status}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => onViewDocument(doc)}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientDocuments;
