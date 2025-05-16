
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { PayrollEntry } from '@/lib/supabase';

export function usePayrollData(selectedClientId: string | null, period: string) {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase) return;
    
    const fetchPayrolls = async () => {
      setIsLoading(true);
      
      try {
        // Usar a RPC para buscar as folhas de pagamento com filtros
        const { data, error } = await supabase.rpc(
          'get_filtered_payrolls',
          { 
            p_client_id: selectedClientId,
            p_period: period
          }
        );
        
        if (error) throw error;
        
        setPayrolls(data || []);
      } catch (error) {
        console.error('Error fetching payrolls:', error);
        toast({
          title: "Erro ao buscar folhas de pagamento",
          description: "Não foi possível carregar as folhas de pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrolls();
  }, [supabase, selectedClientId, period, toast]);

  const refreshPayrolls = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase.rpc(
        'get_filtered_payrolls',
        { 
          p_client_id: selectedClientId,
          p_period: period
        }
      );
      
      if (error) throw error;
      
      setPayrolls(data || []);
    } catch (error) {
      console.error('Error refreshing payrolls:', error);
    }
  };

  return { payrolls, isLoading, refreshPayrolls, setPayrolls };
}
