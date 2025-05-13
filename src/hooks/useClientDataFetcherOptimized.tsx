
import { useSupabaseQuery, useRetry } from './useSupabaseQuery';
import { handleError } from '@/services/errorHandlingService';
import { supabase } from '@/lib/supabaseService';

export function useClientDataFetcherOptimized() {
  const { retry } = useRetry();
  
  // Função para buscar dados do cliente com cache, retry e gestão de erros
  const fetchClientData = async (clientId: string, dataType: string) => {
    try {
      if (!clientId) {
        throw new Error('ID do cliente não fornecido');
      }
      
      // Aguardar delay simulando rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      switch (dataType) {
        case 'financial': {
          // Exemplo usando o retry para operações que podem falhar
          const { result, error, success } = await retry(async () => {
            const data = {
              id: clientId,
              total_revenue: 125000.00,
              total_expenses: 78500.00,
              profit_margin: 0.372,
              period: "2023-05"
            };
            return data;
          }, 3, 1000);
          
          if (!success) {
            throw error || new Error('Falha ao buscar dados financeiros');
          }
          
          return result;
        }
          
        case 'taxes':
          return [
            { 
              id: 1, 
              client_id: clientId, 
              tax_type: "IRPJ", 
              due_date: "2023-05-30", 
              amount: 4580.25,
              status: "pending"
            },
            { 
              id: 2, 
              client_id: clientId, 
              tax_type: "COFINS", 
              due_date: "2023-05-25", 
              amount: 3250.75,
              status: "pending"
            }
          ];
          
        case 'documents':
          return [
            { 
              id: 1, 
              client_id: clientId, 
              name: "Balancete Abril 2023", 
              created_at: "2023-05-10",
              file_type: "pdf"
            },
            { 
              id: 2, 
              client_id: clientId, 
              name: "DRE Q1 2023", 
              created_at: "2023-04-15",
              file_type: "xlsx"
            }
          ];
          
        default:
          return null;
      }
    } catch (error) {
      // Usar o serviço centralizado de tratamento de erros
      handleError(error, {
        context: `Busca de dados do cliente (${dataType})`,
        fallbackMessage: `Não foi possível buscar os dados do cliente (${dataType})`
      });
      return null;
    }
  };

  return {
    fetchClientData
  };
}

// Hook para buscar e fazer cache de dados de cliente com react-query
export function useClientFinancialData(clientId: string | null, enabled = true) {
  return useSupabaseQuery(
    ['client', clientId, 'financial'],
    async () => {
      if (!clientId) return { data: null, error: null };
      
      try {
        const { data, error } = await supabase
          .from('financial_data')
          .select('*')
          .eq('client_id', clientId)
          .order('period', { ascending: false })
          .limit(1)
          .single();
        
        return { data, error };
      } catch (error) {
        handleError(error, { 
          context: 'Busca de dados financeiros',
          fallbackMessage: 'Erro ao buscar dados financeiros'
        });
        return { data: null, error: null };
      }
    },
    { 
      enabled: !!clientId && enabled,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}
