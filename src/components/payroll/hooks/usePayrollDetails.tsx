
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function usePayrollDetails(payrollId: string) {
  const [payrollData, setPayrollData] = useState<any | null>(null);
  const [employeeData, setEmployeeData] = useState<any | null>(null);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !payrollId) return;
    
    const fetchPayrollDetails = async () => {
      setIsLoading(true);
      
      try {
        // Usar Promise.all para fazer todas as requisições em paralelo
        const [payrollResponse, deductionsResponse, benefitsResponse] = await Promise.all([
          // Fetch da folha de pagamento
          supabase.rpc('get_payroll_entry', { p_payroll_id: payrollId }),
          
          // Fetch das deduções
          supabase.rpc('get_payroll_deductions', { p_payroll_id: payrollId }),
          
          // Fetch dos benefícios
          supabase.rpc('get_payroll_benefits', { p_payroll_id: payrollId })
        ]);
        
        // Verificar erros nas respostas
        if (payrollResponse.error) throw payrollResponse.error;
        if (deductionsResponse.error) throw deductionsResponse.error;
        if (benefitsResponse.error) throw benefitsResponse.error;
        
        // Dados da folha de pagamento
        const payrollData = payrollResponse.data;
        setPayrollData(payrollData);
        setDeductions(deductionsResponse.data || []);
        setBenefits(benefitsResponse.data || []);
        
        // Fetch dos dados do funcionário somente se tiver o employee_id
        if (payrollData && payrollData.employee_id) {
          const { data: employeeData, error: employeeError } = await supabase.rpc(
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
      setPayrollData({
        ...payrollData,
        status: newStatus
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
