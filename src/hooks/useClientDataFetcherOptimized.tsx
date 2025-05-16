
import { useSupabaseQuery, useRetry } from './useSupabaseQuery';
import { supabase } from '@/lib/supabase/client';

// Error handling interface
interface ErrorOptions {
  context: string;
  fallbackMessage: string;
}

// Simple error handler function
const handleError = (error: any, options: ErrorOptions) => {
  console.error(`Error in ${options.context}:`, error);
  return { error: true, message: options.fallbackMessage };
};

export function useClientDataFetcherOptimized() {
  const { retry } = useRetry();
  
  // Function to fetch client data with cache, retry and error management
  const fetchClientData = async (clientId: string, dataType: string) => {
    try {
      if (!clientId) {
        throw new Error('Client ID not provided');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      switch (dataType) {
        case 'financial': {
          // Example using retry for operations that may fail
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
            throw error || new Error('Failed to fetch financial data');
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
      // Use centralized error handling service
      return handleError(error, {
        context: `Client data fetch (${dataType})`,
        fallbackMessage: `Could not fetch client data (${dataType})`
      });
    }
  };

  return {
    fetchClientData
  };
}

// Hook to fetch and cache client financial data with react-query
export function useClientFinancialData(clientId: string | null, enabled = true) {
  return useSupabaseQuery(
    ['client', clientId, 'financial'],
    async () => {
      if (!clientId) return { data: null, error: null };
      
      try {
        // Note: In a real app, we would need to ensure 'financial_data' exists in the database
        // For now, we'll return mock data since the table doesn't exist in the types
        const mockData = {
          client_id: clientId,
          total_revenue: 125000.00,
          total_expenses: 78500.00,
          profit_margin: 0.372,
          period: "2023-05"
        };
        
        return { data: mockData, error: null };
      } catch (error) {
        return handleError(error, { 
          context: 'Financial data fetch',
          fallbackMessage: 'Error fetching financial data'
        });
      }
    },
    { 
      enabled: !!clientId && enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
