
import React, { useState, useEffect } from 'react';
import { useSupabaseClient, Employee } from '@/lib/supabase';
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
import { ClientSelector } from "@/components/layout/ClientSelector";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface PayrollGeneratorProps {
  clientId: string | null;
  onPayrollCreated: () => void;
}

export function PayrollGenerator({ clientId: initialClientId, onPayrollCreated }: PayrollGeneratorProps) {
  const [clientId, setClientId] = useState<string | null>(initialClientId);
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
  
  const handleClientChange = (selectedClientId: string) => {
    setClientId(selectedClientId);
  };
  
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
  
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Generate period options for the select
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Generate options for the current year and the previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
      const maxMonth = year === currentYear ? currentMonth : 12;
      
      for (let month = maxMonth; month >= 1; month--) {
        const monthStr = String(month).padStart(2, '0');
        const periodValue = `${year}-${monthStr}`;
        const periodLabel = formatPeriod(periodValue);
        
        options.push(
          <option key={periodValue} value={periodValue}>
            {periodLabel}
          </option>
        );
      }
    }
    
    return options;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector 
            defaultValue={clientId || ""} 
            onSelectClient={handleClientChange} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatePeriodOptions()}
          </select>
        </div>
      </div>
      
      <div className="border rounded-md">
        {!clientId ? (
          <div className="py-8 text-center">
            Selecione um cliente para gerar a folha de pagamento.
          </div>
        ) : isLoading ? (
          <div className="py-8 text-center">Carregando funcionários...</div>
        ) : employees.length === 0 ? (
          <div className="py-8 text-center">
            Nenhum funcionário ativo encontrado para este cliente.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmployees.length === employees.length}
                      onCheckedChange={toggleAllEmployees}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salário Base</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onPayrollCreated}>
          Cancelar
        </Button>
        <Button 
          onClick={calculatePayroll} 
          disabled={!clientId || selectedEmployees.length === 0 || isGenerating}
        >
          {isGenerating ? "Gerando..." : "Gerar Folha de Pagamento"}
        </Button>
      </div>
    </div>
  );
}
