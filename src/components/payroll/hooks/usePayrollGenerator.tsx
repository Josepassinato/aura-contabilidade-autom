
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, Employee } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function usePayrollGenerator(clientId: string | null, onPayrollCreated: () => void) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  const fetchEmployees = useCallback(async () => {
    if (!supabase || !clientId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Using RPC to fetch active employees
      const { data, error } = await supabase.rpc<Employee[]>(
        'get_active_employees',
        { p_client_id: clientId }
      );
      
      if (error) throw error;
      
      setEmployees(data || []);
      // Auto-select all active employees
      if (data && data.length > 0) {
        setSelectedEmployees(data.map(emp => emp.id) || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Erro ao buscar funcionários",
        description: "Não foi possível carregar a lista de funcionários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, clientId, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };
  
  const toggleAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };
  
  const calculatePayroll = async () => {
    if (!supabase || !clientId || selectedEmployees.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Process multiple employees in parallel using Promise.all
      await Promise.all(
        selectedEmployees.map(async (employeeId) => {
          const employee = employees.find(emp => emp.id === employeeId);
          if (!employee) return;

          // Call RPC to generate payroll per employee
          const { error } = await supabase.rpc(
            'generate_payroll',
            {
              p_client_id: clientId,
              p_employee_id: employeeId,
              p_period: period
            }
          );
          
          if (error) throw error;
        })
      );
      
      toast({
        title: "Folha de pagamento gerada",
        description: `Folha de pagamento do período ${formatPeriod(period)} gerada com sucesso.`,
      });
      
      onPayrollCreated();
    } catch (error: any) {
      console.error('Error generating payroll:', error);
      toast({
        title: "Erro ao gerar folha de pagamento",
        description: error.message || "Ocorreu um erro ao gerar a folha de pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    employees,
    isLoading,
    selectedEmployees,
    period,
    isGenerating,
    setPeriod,
    toggleEmployeeSelection,
    toggleAllEmployees,
    calculatePayroll
  };
}

export function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
