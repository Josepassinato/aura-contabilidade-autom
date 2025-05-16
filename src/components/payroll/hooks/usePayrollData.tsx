
import { useState, useEffect } from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Mock data for payrolls - expanded for better testing
const mockPayrolls: PayrollEntry[] = [
  {
    id: '1',
    client_id: 'client-123',
    employee_id: 'emp-1',
    period: '2025-05',
    base_salary: 5000,
    gross_salary: 5500,
    deductions: 1500,
    net_salary: 4000,
    status: 'paid',
    created_at: '2025-05-10T00:00:00Z',
    updated_at: '2025-05-10T00:00:00Z'
  },
  {
    id: '2',
    client_id: 'client-456',
    employee_id: 'emp-2',
    period: '2025-05',
    base_salary: 3000,
    gross_salary: 3200,
    deductions: 900,
    net_salary: 2300,
    status: 'approved',
    created_at: '2025-05-12T00:00:00Z',
    updated_at: '2025-05-12T00:00:00Z'
  },
  {
    id: '3',
    client_id: 'client-123',
    employee_id: 'emp-3',
    period: '2025-04',
    base_salary: 4800,
    gross_salary: 5200,
    deductions: 1400,
    net_salary: 3800,
    status: 'processing',
    created_at: '2025-04-15T00:00:00Z',
    updated_at: '2025-04-15T00:00:00Z'
  }
];

export function usePayrollData(clientId: string | null, period: string) {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    console.log("usePayrollData hook called with:", { clientId, period });
    
    const fetchPayrolls = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay but with a shorter timeout
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Filter mock data based on clientId and period
        const filtered = mockPayrolls.filter(p => {
          if (clientId && p.client_id !== clientId) return false;
          if (period && p.period !== period) return false;
          return true;
        });
        
        console.log("Filtered payrolls:", filtered);
        setPayrolls(filtered);
        setError(null);
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setError(err as Error);
        // Always set a default empty array to prevent UI issues
        setPayrolls([]);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da folha de pagamento",
          variant: "destructive",
        });
      } finally {
        // Set a maximum timeout for loading state to prevent UI freezing
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchPayrolls();
  }, [clientId, period]);
  
  const refreshPayrolls = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API delay with shorter timeout
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Filter mock data based on clientId and period
      const filtered = mockPayrolls.filter(p => {
        if (clientId && p.client_id !== clientId) return false;
        if (period && p.period !== period) return false;
        return true;
      });
      
      setPayrolls(filtered);
      setError(null);
      toast({
        title: "Dados atualizados",
        description: "Folhas de pagamento atualizadas com sucesso",
      });
    } catch (err) {
      console.error('Error refreshing payroll data:', err);
      setError(err as Error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    } finally {
      // Set a maximum timeout for loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };
  
  return { payrolls, isLoading, error, refreshPayrolls };
}
