
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  useEffect(() => {
    if (!payrollId) return;
    
    const fetchPayrollDetails = async () => {
      setIsLoading(true);
      
      try {
        // Em produção, buscar dados reais do Supabase
        setPayrollData(null);
        setDeductions([]);
        setBenefits([]);
        setEmployeeData(null);
      } catch (error: any) {
        console.error('Error fetching payroll details:', error);
        toast({
          title: "Erro ao carregar detalhes",
          description: "Não foi possível carregar os detalhes da folha de pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrollDetails();
  }, [payrollId, toast]);
  
  const handleUpdateStatus = async (newStatus: string) => {
    if (!payrollId) return;
    
    setIsUpdating(true);
    
    try {
      // Em produção, usar cliente real do Supabase
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
        description: "Não foi possível atualizar o status da folha.",
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
