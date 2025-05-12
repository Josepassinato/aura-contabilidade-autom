
import React, { useState, useEffect } from 'react';
import { useSupabaseClient, PayrollEntry } from '@/lib/supabase';
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
import { PayrollGenerator } from './PayrollGenerator';
import { PayrollDetails } from './PayrollDetails';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilePlus, FileText, Calendar, Filter } from 'lucide-react';

export function PayrollList() {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    if (!supabase) return;
    
    const fetchPayrolls = async () => {
      setIsLoading(true);
      
      try {
        let query = supabase.from('payroll_entries').select('*');
        
        if (selectedClientId) {
          query = query.eq('client_id', selectedClientId);
        }

        // Filter by period if selected
        if (period) {
          query = query.eq('period', period);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPayrolls(data);
      } catch (error) {
        console.error('Error fetching payrolls:', error);
        toast({
          title: "Erro ao buscar folhas de pagamento",
          description: "Não foi possível carregar as folhas de pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayrolls();
  }, [supabase, selectedClientId, period, toast]);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
  };
  
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };
  
  const refreshPayrolls = async () => {
    if (!supabase) return;
    
    try {
      let query = supabase.from('payroll_entries').select('*');
      
      if (selectedClientId) {
        query = query.eq('client_id', selectedClientId);
      }
      
      if (period) {
        query = query.eq('period', period);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPayrolls(data);
    } catch (error) {
      console.error('Error refreshing payrolls:', error);
    }
  };
  
  const handlePayrollCreated = () => {
    setIsGeneratorOpen(false);
    refreshPayrolls();
  };
  
  const handleViewPayroll = (payroll: PayrollEntry) => {
    setSelectedPayroll(payroll);
    setIsDetailsOpen(true);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Folhas de Pagamento</h3>
        <Button onClick={() => setIsGeneratorOpen(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          Nova Folha
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <select
              value={period}
              onChange={handlePeriodChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatePeriodOptions()}
            </select>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <Button variant="outline" onClick={refreshPayrolls} className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        {isLoading ? (
          <div className="py-8 text-center">Carregando folhas de pagamento...</div>
        ) : payrolls.length === 0 ? (
          <div className="py-8 text-center">
            {selectedClientId 
              ? "Nenhuma folha de pagamento encontrada para este cliente no período selecionado." 
              : "Selecione um cliente para visualizar as folhas de pagamento."
            }
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Funcionários</TableHead>
                <TableHead>Valor Bruto</TableHead>
                <TableHead>Descontos</TableHead>
                <TableHead>Valor Líquido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>{formatPeriod(payroll.period)}</TableCell>
                  <TableCell>Empresa {payroll.client_id.slice(0, 5)}...</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell>{formatCurrency(payroll.gross_salary)}</TableCell>
                  <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payroll.net_salary)}</TableCell>
                  <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewPayroll(payroll)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Gerar Nova Folha de Pagamento</DialogTitle>
          </DialogHeader>
          <PayrollGenerator
            clientId={selectedClientId}
            onPayrollCreated={handlePayrollCreated}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Folha de Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <PayrollDetails payrollId={selectedPayroll.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
