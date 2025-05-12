
import { useState, useEffect } from 'react';
import { useSupabaseClient, PayrollEntry } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

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
        let query = supabase.from('payroll_entries').select('*');
        
        if (selectedClientId) {
          query = query.eq('client_id', selectedClientId);
        }

        // Filter by period if selected
        if (period) {
          query = query.eq('period', period);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPayrolls(data);
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
      let query = supabase.from('payroll_entries').select('*');
      
      if (selectedClientId) {
        query = query.eq('client_id', selectedClientId);
      }
      
      if (period) {
        query = query.eq('period', period);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPayrolls(data);
    } catch (error) {
      console.error('Error refreshing payrolls:', error);
    }
  };

  return { payrolls, isLoading, refreshPayrolls, setPayrolls };
}
