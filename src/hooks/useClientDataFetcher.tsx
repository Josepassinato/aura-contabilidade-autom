
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useClientDataFetcher() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchClientData = async (clientId: string, dataType: string): Promise<any> => {
    if (!clientId) {
      console.error("Não foi possível obter dados: ID do cliente não fornecido");
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log(`Buscando dados reais do cliente ${clientId}: ${dataType}`);
      
      switch (dataType) {
        case 'financial': {
          // Buscar dados financeiros reais do Supabase
          // Como não temos uma tabela específica ainda, retornar null
          return null;
        }
          
        case 'taxes': {
          const { data, error } = await supabase
            .from('obrigacoes_fiscais')
            .select('*')
            .eq('client_id', clientId)
            .order('prazo', { ascending: true });
          
          if (error) {
            console.error('Erro ao buscar obrigações fiscais:', error);
            return null;
          }
          
          return data;
        }
          
        case 'documents': {
          const { data, error } = await supabase
            .from('client_documents')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Erro ao buscar documentos:', error);
            return null;
          }
          
          return data;
        }
          
        default:
          return null;
      }
    } catch (error) {
      console.error(`Erro ao buscar dados do cliente ${clientId}:`, error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível acessar as informações solicitadas. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchClientData,
    isLoading
  };
}
