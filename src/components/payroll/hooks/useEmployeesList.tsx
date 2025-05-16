
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, Employee } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function useEmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ativos");
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    if (!supabase || !selectedClientId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Using RPC function to fetch employees with filters
      const { data, error } = await supabase.rpc<Employee[]>(
        'get_filtered_employees',
        { 
          p_client_id: selectedClientId,
          p_status: activeTab === "todos" ? null : (activeTab === "ativos" ? 'active' : 'inactive')
        }
      );
      
      if (error) throw error;
      
      setEmployees(data || []);
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
  }, [supabase, selectedClientId, activeTab, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  const handleClientSelect = useCallback((client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
  }, []);
  
  const handleFormSubmit = async (data: any) => {
    if (!supabase || !selectedClientId) return false;
    
    try {
      if (data.id) {
        // Update existing employee
        const { error } = await supabase.rpc(
          'update_employee',
          { 
            p_employee_id: data.id,
            p_name: data.name,
            p_position: data.position,
            p_department: data.department,
            p_hire_date: data.hire_date,
            p_base_salary: parseFloat(data.base_salary),
            p_status: data.status
          }
        );
        
        if (error) throw error;
        
        toast({
          title: "Funcionário atualizado",
          description: `${data.name} foi atualizado com sucesso.`,
        });
      } else {
        // Create new employee
        const { error } = await supabase.rpc(
          'create_employee',
          {
            p_client_id: selectedClientId,
            p_name: data.name,
            p_position: data.position,
            p_department: data.department,
            p_hire_date: data.hire_date,
            p_base_salary: parseFloat(data.base_salary),
            p_status: data.status || 'active',
            p_cpf: data.cpf || '00000000000' // Default temporary value
          }
        );
        
        if (error) throw error;
        
        toast({
          title: "Funcionário adicionado",
          description: `${data.name} foi adicionado com sucesso.`,
        });
      }
      
      // Update employee list
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Erro ao salvar funcionário",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    employees,
    isLoading,
    selectedClientId,
    activeTab,
    setSelectedClientId,
    setActiveTab,
    handleClientSelect,
    handleFormSubmit,
    refreshEmployees: fetchEmployees
  };
}
