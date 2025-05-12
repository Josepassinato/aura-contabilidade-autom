
import React, { useEffect } from 'react';
import { Employee } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Esquema de validação do formulário
const employeeFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  cpf: z.string().min(11, { message: "CPF inválido" }).max(14),
  position: z.string().min(2, { message: "Cargo é obrigatório" }),
  department: z.string().optional(),
  hire_date: z.string().min(1, { message: "Data de admissão é obrigatória" }),
  base_salary: z.string().min(1, { message: "Salário base é obrigatório" }),
  status: z.enum(["active", "inactive", "vacation", "leave"]),
  notes: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSubmit: (data: any) => Promise<boolean>;
}

export function EmployeeFormDialog({ 
  open, 
  onOpenChange, 
  employee, 
  onSubmit 
}: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Inicializar o formulário com dados do funcionário ou valores padrão
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      position: "",
      department: "",
      hire_date: new Date().toISOString().split('T')[0],
      base_salary: "",
      status: "active",
      notes: "",
    }
  });

  // Atualizar o formulário quando o funcionário mudar
  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        cpf: employee.cpf || "",
        position: employee.position,
        department: employee.department || "",
        hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : "",
        base_salary: employee.base_salary ? employee.base_salary.toString() : "",
        status: employee.status as "active" | "inactive" | "vacation" | "leave",
        notes: employee.notes || "",
      });
    } else {
      form.reset({
        name: "",
        cpf: "",
        position: "",
        department: "",
        hire_date: new Date().toISOString().split('T')[0],
        base_salary: "",
        status: "active",
        notes: "",
      });
    }
  }, [employee, form]);

  // Formatar CPF
  const formatCPF = (value: string) => {
    // Remover caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 3) return numericValue;
    if (numericValue.length <= 6) return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    if (numericValue.length <= 9) return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
  };

  // Formatar moeda
  const formatCurrency = (value: string) => {
    // Remover caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";

    // Converter para decimal e formatar
    const decimal = Number(numericValue) / 100;
    return decimal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Limpar formatação do CPF
      const cleanCPF = values.cpf.replace(/\D/g, "");
      
      // Converter string de moeda para número
      const baseSalary = parseFloat(values.base_salary.replace(/\D/g, "")) / 100;
      
      const submitData = {
        ...values,
        cpf: cleanCPF,
        base_salary: baseSalary,
        id: employee?.id,
      };
      
      const success = await onSubmit(submitData);
      
      if (success) {
        onOpenChange(false);
        toast({
          title: employee ? "Funcionário atualizado" : "Funcionário adicionado",
          description: `${values.name} foi ${employee ? "atualizado" : "adicionado"} com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o funcionário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipuladores para campos específicos
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    form.setValue("cpf", formatted, { shouldValidate: true });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remover formatação e guardar apenas números
    const numericValue = e.target.value.replace(/\D/g, "");
    
    // Armazenar valor sem formatação para processamento
    form.setValue("base_salary", numericValue ? (parseInt(numericValue) / 100).toString() : "", { shouldValidate: true });
    
    // Mostrar valor formatado para o usuário
    e.target.value = numericValue ? formatCurrency(numericValue) : "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Funcionário" : "Adicionar Funcionário"}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* CPF */}
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="000.000.000-00" 
                            value={field.value}
                            onChange={handleCPFChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cargo */}
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Cargo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Departamento */}
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Data de Admissão */}
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
                  
                  {/* Salário Base */}
                  <FormField
                    control={form.control}
                    name="base_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Base</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="R$ 0,00" 
                            onChange={handleSalaryChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            defaultValue={field.value ? formatCurrency((parseFloat(field.value) * 100).toString()) : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
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
                
                {/* Observações */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais sobre o funcionário" 
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : employee ? "Atualizar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
