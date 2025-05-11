
import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Employee } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { UserPlus, FileEdit, Trash2, Search } from 'lucide-react';

const employeeFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  cpf: z.string().min(11, { message: "CPF deve ter pelo menos 11 caracteres" }),
  position: z.string().min(2, { message: "Cargo é obrigatório" }),
  department: z.string().optional(),
  hire_date: z.string().min(1, { message: "Data de admissão é obrigatória" }),
  base_salary: z.coerce.number().positive({ message: "Salário deve ser maior que zero" }),
  status: z.enum(['active', 'inactive', 'vacation', 'leave'], { 
    required_error: "Status é obrigatório" 
  }),
  client_id: z.string().min(1, { message: "Cliente é obrigatório" }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      position: "",
      department: "",
      hire_date: new Date().toISOString().split('T')[0],
      base_salary: 0,
      status: "active",
      client_id: "",
    },
  });

  useEffect(() => {
    if (!supabase) return;
    
    const fetchEmployees = async () => {
      setIsLoading(true);
      
      try {
        let query = supabase.from('employees').select('*');
        
        if (selectedClientId) {
          query = query.eq('client_id', selectedClientId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setEmployees(data);
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
  }, [supabase, selectedClientId, toast]);
  
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  
  const openNewEmployeeDialog = () => {
    setEditingEmployee(null);
    form.reset({
      name: "",
      cpf: "",
      position: "",
      department: "",
      hire_date: new Date().toISOString().split('T')[0],
      base_salary: 0,
      status: "active",
      client_id: selectedClientId || "",
    });
    setIsDialogOpen(true);
  };
  
  const openEditEmployeeDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      name: employee.name,
      cpf: employee.cpf,
      position: employee.position,
      department: employee.department || "",
      hire_date: employee.hire_date,
      base_salary: employee.base_salary,
      status: employee.status,
      client_id: employee.client_id,
    });
    setIsDialogOpen(true);
  };
  
  const onSubmit = async (data: EmployeeFormValues) => {
    if (!supabase) return;
    
    try {
      if (editingEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update({
            name: data.name,
            cpf: data.cpf,
            position: data.position,
            department: data.department,
            hire_date: data.hire_date,
            base_salary: data.base_salary,
            status: data.status,
          })
          .eq('id', editingEmployee.id);
          
        if (error) throw error;
        
        toast({
          title: "Funcionário atualizado",
          description: `${data.name} foi atualizado com sucesso.`,
        });
      } else {
        // Insert new employee
        const { error } = await supabase
          .from('employees')
          .insert([{
            name: data.name,
            cpf: data.cpf,
            position: data.position,
            department: data.department,
            hire_date: data.hire_date,
            base_salary: data.base_salary,
            status: data.status,
            client_id: data.client_id,
          }]);
          
        if (error) throw error;
        
        toast({
          title: "Funcionário cadastrado",
          description: `${data.name} foi adicionado com sucesso.`,
        });
      }
      
      // Refresh employee list
      const { data: updatedEmployees } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', selectedClientId || data.client_id);
        
      if (updatedEmployees) {
        setEmployees(updatedEmployees);
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o funcionário.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!supabase) return;
    
    if (confirm(`Tem certeza que deseja excluir o funcionário ${name}?`)) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setEmployees(employees.filter(employee => employee.id !== id));
        
        toast({
          title: "Funcionário excluído",
          description: `${name} foi removido com sucesso.`,
        });
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao excluir o funcionário.",
          variant: "destructive",
        });
      }
    }
  };
  
  const formatCPF = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formato CPF: XXX.XXX.XXX-XX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };
  
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    form.setValue("cpf", formattedCPF);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.cpf.includes(searchTerm) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
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
        <Button onClick={openNewEmployeeDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/3">
          <ClientSelector onSelectClient={handleClientChange} />
        </div>
        
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar funcionário por nome, CPF ou cargo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        {isLoading ? (
          <div className="py-8 text-center">Carregando funcionários...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-8 text-center">
            {selectedClientId ? "Nenhum funcionário cadastrado para este cliente." : "Selecione um cliente para visualizar seus funcionários."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Data Admissão</TableHead>
                <TableHead>Salário Base</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.cpf}</TableCell>
                  <TableCell>
                    {employee.position}
                    {employee.department && <div className="text-xs text-muted-foreground">{employee.department}</div>}
                  </TableCell>
                  <TableCell>{new Date(employee.hire_date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditEmployeeDialog(employee)}>
                      <FileEdit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee.id, employee.name)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
            <DialogDescription>
              {editingEmployee 
                ? "Atualize os dados do funcionário nos campos abaixo."
                : "Preencha os dados do novo funcionário."
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do funcionário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXX.XXX.XXX-XX" 
                          {...field} 
                          onChange={handleCPFChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Cargo do funcionário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Departamento (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Admissão</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="base_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário Base</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0,00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="vacation">Férias</SelectItem>
                          <SelectItem value="leave">Licença</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!editingEmployee && (
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <ClientSelector 
                          defaultValue={selectedClientId || ""} 
                          onSelectClient={(clientId) => form.setValue("client_id", clientId)} 
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Atualizar" : "Cadastrar"} Funcionário
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
