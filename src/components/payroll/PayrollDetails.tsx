import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, FileCog, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPeriod } from './hooks/usePayrollGenerator';

interface PayrollDetailsProps {
  payrollId: string;
}

export function PayrollDetails({ payrollId }: PayrollDetailsProps) {
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
          supabase.rpc('get_payroll_entry', { payroll_id: payrollId }),
          
          // Fetch das deduções
          supabase.rpc('get_payroll_deductions', { payroll_id: payrollId }),
          
          // Fetch dos benefícios
          supabase.rpc('get_payroll_benefits', { payroll_id: payrollId })
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
            { employee_id: payrollData.employee_id }
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
        { payroll_id: payrollId, new_status: newStatus }
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'paid':
        return <Badge variant="default">Pago</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Carregando detalhes da folha de pagamento...</div>;
  }
  
  if (!payrollData) {
    return <div className="py-8 text-center">Dados não encontrados.</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Folha de Pagamento - {formatPeriod(payrollData.period)}
          </h3>
          <div className="text-sm text-muted-foreground">
            Gerada em {new Date(payrollData.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(payrollData.status)}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Dados do Funcionário</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{employeeData?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF:</span>
                <span>{employeeData?.cpf || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cargo:</span>
                <span>{employeeData?.position || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departamento:</span>
                <span>{employeeData?.department || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Admissão:</span>
                <span>{employeeData?.hire_date ? new Date(employeeData.hire_date).toLocaleDateString('pt-BR') : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Resumo da Folha</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Período:</span>
                <span>{formatPeriod(payrollData.period)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salário Base:</span>
                <span>{formatCurrency(payrollData.base_salary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salário Bruto:</span>
                <span className="font-medium">{formatCurrency(payrollData.gross_salary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descontos:</span>
                <span className="text-red-600">-{formatCurrency(payrollData.deductions)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Salário Líquido:</span>
                <span className="font-bold text-lg">{formatCurrency(payrollData.net_salary)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-semibold">Detalhamento dos Valores</h4>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="font-semibold bg-muted/30">Proventos</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Salário Base</TableCell>
              <TableCell>Base</TableCell>
              <TableCell className="text-right">{formatCurrency(payrollData.base_salary)}</TableCell>
            </TableRow>
            
            {benefits.map((benefit) => (
              <TableRow key={benefit.id}>
                <TableCell>{benefit.description}</TableCell>
                <TableCell>{benefit.type}</TableCell>
                <TableCell className="text-right">{formatCurrency(benefit.amount)}</TableCell>
              </TableRow>
            ))}
            
            <TableRow>
              <TableCell colSpan={3} className="font-semibold bg-muted/30">Descontos</TableCell>
            </TableRow>
            
            {deductions.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell>{deduction.description}</TableCell>
                <TableCell>{deduction.type}</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(deduction.amount)}</TableCell>
              </TableRow>
            ))}
            
            <TableRow className="font-bold">
              <TableCell>Total Líquido</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">{formatCurrency(payrollData.net_salary)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {payrollData.status !== 'paid' && (
        <div className="flex justify-end gap-2 pt-4">
          {payrollData.status === 'draft' && (
            <Button 
              variant="outline"
              onClick={() => handleUpdateStatus('processing')}
              disabled={isUpdating}
            >
              <FileCog className="h-4 w-4 mr-2" />
              Processar
            </Button>
          )}
          
          {payrollData.status === 'processing' && (
            <Button 
              variant="outline"
              className="bg-green-50 border-green-200 hover:bg-green-100 text-green-800"
              onClick={() => handleUpdateStatus('approved')}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          )}
          
          {payrollData.status === 'approved' && (
            <Button 
              variant="default"
              onClick={() => handleUpdateStatus('paid')}
              disabled={isUpdating}
            >
              Registrar Pagamento
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
