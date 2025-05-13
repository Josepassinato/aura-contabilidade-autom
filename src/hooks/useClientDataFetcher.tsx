
import { useState } from 'react';

export function useClientDataFetcher() {
  // Function to fetch client data (simplified local version)
  const fetchClientData = async (clientId: string, dataType: string) => {
    // Implementação simplificada que retorna dados simulados
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      switch (dataType) {
        case 'financial':
          return {
            id: clientId,
            total_revenue: 125000.00,
            total_expenses: 78500.00,
            profit_margin: 0.372,
            period: "2023-05"
          };
          
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
      console.error("Erro ao buscar dados do cliente:", error);
      return null;
    }
  };

  return {
    fetchClientData
  };
}
