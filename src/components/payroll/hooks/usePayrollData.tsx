
import { useState, useEffect } from 'react';
import { PayrollEntry } from '@/lib/supabase';

// Mock data for payrolls
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
  }
];

export function usePayrollData(clientId: string | null, period: string) {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter mock data based on clientId and period
        const filtered = mockPayrolls.filter(p => {
          if (clientId && p.client_id !== clientId) return false;
          if (period && p.period !== period) return false;
          return true;
        });
        
        setPayrolls(filtered);
        setError(null);
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setError(err as Error);
        setPayrolls([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrolls();
  }, [clientId, period]);
  
  const refreshPayrolls = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on clientId and period
      const filtered = mockPayrolls.filter(p => {
        if (clientId && p.client_id !== clientId) return false;
        if (period && p.period !== period) return false;
        return true;
      });
      
      setPayrolls(filtered);
      setError(null);
    } catch (err) {
      console.error('Error refreshing payroll data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { payrolls, isLoading, error, refreshPayrolls };
}
