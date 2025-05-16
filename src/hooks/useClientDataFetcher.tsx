
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type ClientData = {
  financialData?: any;
  obligations?: any[];
  documents?: any[];
  fiscalInfo?: any;
};

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
      // Em um ambiente real, aqui fariam as chamadas para APIs ou banco de dados
      // Nesta implementação de exemplo, simulamos dados com base no clientId
      
      // Simulação de tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dados simulados para demonstração
      const data = getMockClientData(clientId, dataType);
      
      // Registrar acesso às informações para auditoria
      console.log(`Acesso a dados do cliente ${clientId}: ${dataType}`);
      
      return data;
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
  
  // Função que fornece dados simulados com base no ID do cliente e tipo de dados
  const getMockClientData = (clientId: string, dataType: string): any => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Dados financeiros simulados
    if (dataType === 'financial') {
      return {
        revenue: {
          lastMonth: 124500.45,
          currentMonth: 138750.20,
          quarterly: 384200.75,
          yearly: 1245800.38
        },
        expenses: {
          lastMonth: 86420.32,
          currentMonth: 94325.18,
          quarterly: 268450.45,
          yearly: 876540.89
        },
        profit: {
          lastMonth: 38080.13,
          currentMonth: 44425.02,
          quarterly: 115750.30,
          yearly: 369259.49
        },
        cashFlow: {
          current: 215680.45,
          projected: 245000.00
        }
      };
    }
    
    // Obrigações fiscais simuladas
    if (dataType === 'obligations') {
      return [
        {
          id: '1',
          name: 'ICMS',
          dueDate: `15/${currentMonth}/${currentYear}`,
          value: 12450.32,
          status: 'pendente'
        },
        {
          id: '2',
          name: 'DARF PIS/COFINS',
          dueDate: `25/${currentMonth}/${currentYear}`,
          value: 8320.45,
          status: 'pendente'
        },
        {
          id: '3',
          name: 'IRPJ',
          dueDate: `30/${currentMonth}/${currentYear}`,
          value: 15740.87,
          status: 'pendente'
        },
        {
          id: '4',
          name: 'GFIP',
          dueDate: `20/${currentMonth}/${currentYear}`,
          value: 6540.12,
          status: 'pendente'
        }
      ];
    }
    
    // Documentos simulados
    if (dataType === 'documents') {
      return [
        {
          id: '1',
          name: 'Balanço Patrimonial',
          date: `01/${currentMonth}/${currentYear}`,
          type: 'Contábil'
        },
        {
          id: '2',
          name: 'Demonstração de Resultado',
          date: `01/${currentMonth}/${currentYear}`,
          type: 'Contábil'
        },
        {
          id: '3',
          name: 'Declaração de ICMS',
          date: `10/${currentMonth - 1 || 12}/${currentMonth - 1 ? currentYear : currentYear - 1}`,
          type: 'Fiscal'
        },
        {
          id: '4',
          name: 'Relatório de Fluxo de Caixa',
          date: `05/${currentMonth}/${currentYear}`,
          type: 'Financeiro'
        }
      ];
    }
    
    // Informações fiscais simuladas
    if (dataType === 'fiscal') {
      return {
        regime: 'Simples Nacional',
        cnae: '6201-5/01 - Desenvolvimento de programas de computador sob encomenda',
        inscricaoEstadual: '123.456.789.0001',
        aliquotaSimples: '6%',
        faturamentoAnual: 'R$ 1.245.800,38',
        limiteAtual: 'R$ 4.800.000,00'
      };
    }
    
    return null;
  };

  return {
    fetchClientData,
    isLoading
  };
}
