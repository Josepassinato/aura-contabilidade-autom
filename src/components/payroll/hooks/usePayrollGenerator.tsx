
import { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    if (!supabase || !clientId) return;
    
    const fetchEmployees = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('client_id', clientId)
          .eq('status', 'active');
        
        if (error) throw error;
        
        setEmployees(data || []);
        // Auto-select all active employees
        setSelectedEmployees(data?.map(emp => emp.id) || []);
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
    };
    
    fetchEmployees();
  }, [supabase, clientId, toast]);

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
      for (const employeeId of selectedEmployees) {
        const employee = employees.find(emp => emp.id === employeeId);
        
        if (!employee) continue;
        
        // Simple calculation for this example (in a real app, this would be more complex)
        const baseSalary = employee.base_salary;
        const grossSalary = baseSalary;
        
        // Calculate INSS (simplified example)
        let inssRate = 0;
        if (grossSalary <= 1412) inssRate = 0.075;
        else if (grossSalary <= 2666.68) inssRate = 0.09;
        else if (grossSalary <= 4000) inssRate = 0.12;
        else inssRate = 0.14;
        
        const inssDeduction = Math.min(grossSalary * inssRate, 828.39); // Max INSS in 2024
        
        // Calculate IRRF (simplified example)
        let irrfBase = grossSalary - inssDeduction;
        let irrfRate = 0;
        let irrfDeduction = 0;
        
        if (irrfBase <= 2112) {
          irrfRate = 0;
          irrfDeduction = 0;
        } else if (irrfBase <= 2826.65) {
          irrfRate = 0.075;
          irrfDeduction = 158.40;
        } else if (irrfBase <= 3751.05) {
          irrfRate = 0.15;
          irrfDeduction = 370.40;
        } else if (irrfBase <= 4664.68) {
          irrfRate = 0.225;
          irrfDeduction = 651.73;
        } else {
          irrfRate = 0.275;
          irrfDeduction = 884.96;
        }
        
        const irrfValue = Math.max(0, (irrfBase * irrfRate) - irrfDeduction);
        const totalDeductions = inssDeduction + irrfValue;
        const netSalary = grossSalary - totalDeductions;
        
        // Insert payroll entry
        const { data: payrollData, error: payrollError } = await supabase
          .from('payroll_entries')
          .insert([{
            client_id: clientId,
            employee_id: employeeId,
            period: period,
            base_salary: baseSalary,
            gross_salary: grossSalary,
            deductions: totalDeductions,
            net_salary: netSalary,
            status: 'draft'
          }])
          .select();
        
        if (payrollError) throw payrollError;
        
        if (payrollData && payrollData[0]) {
          const payrollEntryId = payrollData[0].id;
          
          // Insert deductions
          await supabase
            .from('payroll_deductions')
            .insert([
              {
                payroll_entry_id: payrollEntryId,
                type: 'inss',
                description: 'INSS',
                amount: inssDeduction
              },
              {
                payroll_entry_id: payrollEntryId,
                type: 'irrf',
                description: 'IRRF',
                amount: irrfValue
              }
            ]);
        }
      }
      
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
