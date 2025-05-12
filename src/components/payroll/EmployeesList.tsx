
import React, { useState, useEffect } from 'react';
import { useSupabaseClient, Employee } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClientSelector } from "@/components/layout/ClientSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, User, Users } from "lucide-react";

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
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
  
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (data: any) => {
    if (!supabase || !selectedClientId) return;
    
    try {
      if (editingEmployee) {
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
          .eq('id', editingEmployee.id);
        
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
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Erro ao salvar funcionário",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive",
      });
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'vacation':
        return <Badge className="bg-blue-100 text-blue-800">Férias</Badge>;
      case 'leave':
        return <Badge className="bg-yellow-100 text-yellow-800">Licença</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Funcionários</h3>
        <Button onClick={handleAddEmployee}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        <div className="w-full md:w-1/2">
          <Button variant="outline" onClick={() => {}} className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ativos">Funcionários Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Funcionários Inativos</TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="border rounded-md">
        {!selectedClientId ? (
          <div className="py-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Selecione um cliente</h3>
            <p className="text-sm text-muted-foreground">
              Selecione um cliente para visualizar seus funcionários.
            </p>
          </div>
        ) : isLoading ? (
          <div className="py-8 text-center">Carregando funcionários...</div>
        ) : employees.length === 0 ? (
          <div className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Nenhum funcionário encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "todos" 
                ? "Este cliente não possui funcionários cadastrados." 
                : `Este cliente não possui funcionários ${activeTab === "ativos" ? "ativos" : "inativos"}.`}
            </p>
            <Button onClick={handleAddEmployee} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Funcionário
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Data de Admissão</TableHead>
                <TableHead>Salário Base</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department || "-"}</TableCell>
                  <TableCell>{formatDate(employee.hire_date)}</TableCell>
                  <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditEmployee(employee)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Editar Funcionário" : "Adicionar Funcionário"}
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent>
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Formulário de cadastro de funcionários estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmployeesList;
