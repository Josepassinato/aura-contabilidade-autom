
import { useState, useEffect } from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";

export function usePayrollData(clientId: string | null, period: string) {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    logger.debug("usePayrollData hook called with:", { clientId, period }, "usePayrollData");
    
    const fetchPayrolls = async () => {
      try {
        setIsLoading(true);
        
        // Em produção, aqui seria feita a busca real dos dados no Supabase
        // Simulando uma busca que retorna dados vazios
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Retorna array vazio - sem dados simulados
        setPayrolls([]);
        setError(null);
      } catch (err) {
        logger.error('Error fetching payroll data:', err, "usePayrollData");
        setError(err as Error);
        setPayrolls([]);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da folha de pagamento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrolls();
  }, [clientId, period]);
  
  const refreshPayrolls = async () => {
    try {
      setIsLoading(true);
      
      // Em produção, aqui seria feita a atualização real dos dados
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Retorna array vazio - sem dados simulados
      setPayrolls([]);
      setError(null);
      toast({
        title: "Dados atualizados",
        description: "Folhas de pagamento atualizadas com sucesso",
      });
    } catch (err) {
      logger.error('Error refreshing payroll data:', err, "usePayrollData");
      setError(err as Error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return { payrolls, isLoading, error, refreshPayrolls };
}
