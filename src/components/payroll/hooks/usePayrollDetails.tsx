
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface PayrollData {
  id: string;
  client_id: string;
  employee_id: string;
  period: string;
  base_salary: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
}

interface EmployeeData {
  id: string;
  name: string;
  position: string;
  department: string | null;
  hire_date: string;
  cpf: string;
  status: string;
}

interface PayrollDeduction {
  id: string;
  description: string;
  amount: number;
  type: string;
}

interface PayrollBenefit {
  id: string;
  description: string;
  amount: number;
  type: string;
}

export function usePayrollDetails(payrollId: string) {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [deductions, setDeductions] = useState<PayrollDeduction[]>([]);
  const [benefits, setBenefits] = useState<PayrollBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !payrollId) return;
    
    const fetchPayrollDetails = async () => {
      setIsLoading(true);
      
      try {
        // Using Promise.all to make all requests in parallel
        const [payrollResponse, deductionsResponse, benefitsResponse] = await Promise.all([
          // Fetch payroll
          supabase.rpc<PayrollData>('get_payroll_entry', { p_payroll_id: payrollId }),
          
          // Fetch deductions
          supabase.rpc<PayrollDeduction[]>('get_payroll_deductions', { p_payroll_id: payrollId }),
          
          // Fetch benefits
          supabase.rpc<PayrollBenefit[]>('get_payroll_benefits', { p_payroll_id: payrollId })
        ]);
        
        // Check for errors in responses
        if (payrollResponse.error) throw payrollResponse.error;
        if (deductionsResponse.error) throw deductionsResponse.error;
        if (benefitsResponse.error) throw benefitsResponse.error;
        
        // Payroll data
        const payrollData = payrollResponse.data;
        setPayrollData(payrollData);
        setDeductions(deductionsResponse.data || []);
        setBenefits(benefitsResponse.data || []);
        
        // Fetch employee data only if we have the employee_id
        if (payrollData && payrollData.employee_id) {
          const { data: employeeData, error: employeeError } = await supabase.rpc<EmployeeData>(
            'get_employee_details',
            { p_employee_id: payrollData.employee_id }
          );
          
          if (employeeError) throw employeeError;
          setEmployeeData(employeeData);
        }
      } catch (error: any) {
        console.error('Error fetching payroll details:', error);
        toast({
          title: "Erro ao carregar detalhes",
          description: error.message || "Não foi possível carregar os detalhes da folha de pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrollDetails();
  }, [supabase, payrollId, toast]);
  
  const handleUpdateStatus = async (newStatus: string) => {
    if (!supabase || !payrollId) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase.rpc(
        'update_payroll_status',
        { p_payroll_id: payrollId, p_new_status: newStatus }
      );
        
      if (error) throw error;
      
      // Update local state
      setPayrollData(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          status: newStatus
        };
      });
      
      toast({
        title: "Folha de pagamento atualizada",
        description: `Status alterado para ${getStatusLabel(newStatus)}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status da folha.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'processing': return 'Processando';
      case 'approved': return 'Aprovado';
      case 'paid': return 'Pago';
      default: return status;
    }
  };

  return {
    payrollData,
    employeeData,
    deductions,
    benefits,
    isLoading,
    isUpdating,
    handleUpdateStatus
  };
}
