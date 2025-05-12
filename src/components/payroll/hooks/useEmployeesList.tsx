
import { useState, useEffect } from 'react';
import { useSupabaseClient, Employee } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function useEmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ativos");
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !selectedClientId) return;
    
    const fetchEmployees = async () => {
      setIsLoading(true);
      
      try {
        let query = supabase
          .from('employees')
          .select('*')
          .eq('client_id', selectedClientId);
        
        if (activeTab === "ativos") {
          query = query.eq('status', 'active');
        } else if (activeTab === "inativos") {
          query = query.eq('status', 'inactive');
        }
        
        const { data, error } = await query
          .order('name');
        
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
    };
    
    fetchEmployees();
  }, [supabase, selectedClientId, activeTab, toast]);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
  };
  
  const handleFormSubmit = async (data: any) => {
    if (!supabase || !selectedClientId) return;
    
    try {
      if (data.id) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update({
            name: data.name,
            position: data.position,
            department: data.department,
            hire_date: data.hire_date,
            base_salary: parseFloat(data.base_salary),
            status: data.status
          })
          .eq('id', data.id);
        
        if (error) throw error;
        
        toast({
          title: "Funcionário atualizado",
          description: `${data.name} foi atualizado com sucesso.`,
        });
      } else {
        // Create new employee
        const { error } = await supabase
          .from('employees')
          .insert([{
            client_id: selectedClientId,
            name: data.name,
            position: data.position,
            department: data.department,
            hire_date: data.hire_date,
            base_salary: parseFloat(data.base_salary),
            status: data.status || 'active'
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Funcionário adicionado",
          description: `${data.name} foi adicionado com sucesso.`,
        });
      }
      
      // Refresh the employee list
      const { data: updatedData } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', selectedClientId)
        .eq('status', activeTab === "ativos" ? 'active' : 'inactive')
        .order('name');
      
      setEmployees(updatedData || []);
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
    handleFormSubmit
  };
}
