
import { useState, useEffect, useCallback } from 'react';
import { Employee } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function usePayrollGenerator(clientId: string | null, onPayrollCreated: () => void) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  const fetchEmployees = useCallback(async () => {
    if (!clientId) {
      setEmployees([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Em produção, buscar funcionários ativos reais do Supabase
      setEmployees([]);
      setSelectedEmployees([]);
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
  }, [clientId, toast]);

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
    if (!clientId || selectedEmployees.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Em produção, usar cliente real do Supabase para gerar folha de pagamento
      toast({
        title: "Folha de pagamento gerada",
        description: `Folha de pagamento do período ${formatPeriod(period)} gerada com sucesso.`,
      });
      
      onPayrollCreated();
    } catch (error: any) {
      console.error('Error generating payroll:', error);
      toast({
        title: "Erro ao gerar folha de pagamento",
        description: "Ocorreu um erro ao gerar a folha de pagamento.",
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
