
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";
import { getFileUrl } from "@/services/supabase/storageService";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'pendente' | 'processado' | 'rejeitado';
  file_path?: string;
}

export const useClientDocuments = (clientId: string | null) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const loadDocuments = async (clientId: string) => {
    setIsLoading(true);
    
    try {
      if (supabase) {
        // Fetch client documents from Supabase
        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: formatFileSize(doc.size || 0),
            date: new Date(doc.created_at || doc.updated_at).toLocaleDateString('pt-BR'),
            status: doc.status,
            file_path: doc.file_path
          }));
          
          setDocuments(formattedDocs);
        }
      } else {
        // Fallback to mock data when Supabase is not available
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

  useEffect(() => {
    if (clientId) {
      loadDocuments(clientId);
    }
  }, [clientId]);

  const handleViewDocument = async (document: Document) => {
    if (!document.file_path) {
      toast({
        title: "Erro ao visualizar documento",
        description: "Não foi possível acessar este documento.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Use the storage service to get a signed URL
      const signedUrl = await getFileUrl(document.file_path);
      
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        throw new Error("Não foi possível obter a URL do documento");
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

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    documents: filteredDocuments,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleViewDocument,
    loadDocuments
  };
};
