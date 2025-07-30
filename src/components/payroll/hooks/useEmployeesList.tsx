
import { useState, useEffect, useCallback } from 'react';
import { Employee } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function useEmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ativos");
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    if (!selectedClientId) {
      setEmployees([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Em produção, buscar funcionários reais da tabela employees
      setEmployees([]);
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
  }, [selectedClientId, activeTab, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  const handleClientSelect = useCallback((client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
  }, []);
  
  const handleFormSubmit = async (data: any) => {
    if (!selectedClientId) return false;
    
    try {
      // Em produção, usar cliente real do Supabase para salvar funcionários
      toast({
        title: data.id ? "Funcionário atualizado" : "Funcionário adicionado",
        description: `${data.name} foi ${data.id ? 'atualizado' : 'adicionado'} com sucesso.`,
      });
      
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
