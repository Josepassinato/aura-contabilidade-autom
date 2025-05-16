
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";
import { getFileUrl } from "@/services/supabase/storageService";
import { Document } from "@/lib/supabase";

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
        const result = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
          
        const { data, error } = result;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedDocs = data.map(doc => ({
            id: doc.id,
            client_id: doc.client_id,
            title: doc.title,
            name: doc.name,
            type: doc.type,
            size: doc.size || 0, // Ensure size is a number
            date: new Date(doc.created_at || doc.updated_at).toLocaleDateString('pt-BR'),
            status: doc.status as 'pendente' | 'processado' | 'rejeitado',
            file_path: doc.file_path,
            created_at: doc.created_at,
            updated_at: doc.updated_at
          }));
          
          setDocuments(formattedDocs);
        }
      } else {
        // Fallback to mock data when Supabase is not available
        const mockDocuments: Document[] = [
          { 
            id: '1', 
            client_id: clientId || '', 
            name: 'NFe-2025-001245.pdf', 
            title: 'NFe-2025-001245.pdf',
            type: 'nota-fiscal', 
            size: 420000, // Use number instead of string
            date: '15/05/2025', 
            status: 'processado',
            created_at: '2025-05-15T12:00:00Z'
          },
          { 
            id: '2', 
            client_id: clientId || '',
            name: 'Recibo-Aluguel-Maio.pdf', 
            title: 'Recibo-Aluguel-Maio.pdf',
            type: 'recibo', 
            size: 180000, // Use number instead of string
            date: '10/05/2025', 
            status: 'processado',
            created_at: '2025-05-10T12:00:00Z'
          },
          { 
            id: '3', 
            client_id: clientId || '',
            name: 'Extrato-BancoXYZ-Maio.pdf', 
            title: 'Extrato-BancoXYZ-Maio.pdf',
            type: 'extrato', 
            size: 310000, // Use number instead of string
            date: '05/05/2025', 
            status: 'pendente',
            created_at: '2025-05-05T12:00:00Z'
          },
          { 
            id: '4', 
            client_id: clientId || '',
            name: 'Contrato-Prestacao-Servicos.pdf', 
            title: 'Contrato-Prestacao-Servicos.pdf',
            type: 'contrato', 
            size: 1200000, // Use number instead of string
            date: '01/05/2025', 
            status: 'processado',
            created_at: '2025-05-01T12:00:00Z'
          },
          { 
            id: '5', 
            client_id: clientId || '',
            name: 'NFe-2025-001189.pdf', 
            title: 'NFe-2025-001189.pdf',
            type: 'nota-fiscal', 
            size: 390000, // Use number instead of string
            date: '28/04/2025', 
            status: 'processado',
            created_at: '2025-04-28T12:00:00Z'
          },
          { 
            id: '6', 
            client_id: clientId || '',
            name: 'Folha-Pagamento-Abril.pdf', 
            title: 'Folha-Pagamento-Abril.pdf',
            type: 'outro', 
            size: 280000, // Use number instead of string
            date: '25/04/2025', 
            status: 'rejeitado',
            created_at: '2025-04-25T12:00:00Z'
          },
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
