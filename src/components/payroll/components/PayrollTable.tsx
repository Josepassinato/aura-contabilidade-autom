
import React from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from 'lucide-react';

interface PayrollTableProps {
  payrolls: PayrollEntry[];
  isLoading: boolean;
  selectedClientId: string | null;
  onViewPayroll: (payroll: PayrollEntry) => void;
}

export function PayrollTable({ 
  payrolls, 
  isLoading, 
  selectedClientId, 
  onViewPayroll 
}: PayrollTableProps) {
  
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

  return (
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
                    onClick={() => onViewPayroll(payroll)}
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
  );
}
