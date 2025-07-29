
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";
import { getFileUrl } from "@/services/supabase/storageService";
import { Document } from "@/lib/supabase";
import { logger } from "@/utils/logger";

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
        const query = supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
          
        const result = await query.limit(100);
        
        if (result.error) {
          logger.error("Erro ao carregar documentos:", result.error, 'UseClientDocuments');
          setDocuments([]);
          toast({
            title: "Erro ao carregar documentos",
            description: "Não foi possível carregar a lista de documentos.",
            variant: "destructive"
          });
          return;
        }
        
        if (result.data) {
          const formattedDocs = result.data.map(doc => ({
            id: doc.id,
            client_id: doc.client_id,
            title: doc.title,
            name: doc.name,
            type: doc.type,
            size: doc.size || 0,
            date: new Date(doc.created_at || doc.updated_at).toLocaleDateString('pt-BR'),
            status: doc.status as 'pendente' | 'processado' | 'rejeitado',
            file_path: doc.file_path,
            created_at: doc.created_at,
            updated_at: doc.updated_at
          }));
          
          setDocuments(formattedDocs);
        } else {
          setDocuments([]);
        }
      } else {
        logger.error("Supabase client não disponível", undefined, 'UseClientDocuments');
        setDocuments([]);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco de dados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error("Erro ao carregar documentos:", error, 'UseClientDocuments');
      setDocuments([]);
      toast({
        title: "Erro ao carregar documentos",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadDocuments(clientId);
    } else {
      setDocuments([]);
      setIsLoading(false);
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
      const signedUrl = await getFileUrl(document.file_path);
      
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        throw new Error("Não foi possível obter a URL do documento");
      }
    } catch (error) {
      logger.error("Erro ao obter URL do documento:", error, 'UseClientDocuments');
      toast({
        title: "Erro ao visualizar documento",
        description: "Não foi possível acessar este documento. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
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
