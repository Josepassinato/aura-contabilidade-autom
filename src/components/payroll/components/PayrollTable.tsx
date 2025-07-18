
import React from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Loader2 } from 'lucide-react';
import { formatCurrency, formatPeriod, getStatusBadge } from '../utils/payrollFormatters';

interface PayrollTableProps {
  payrolls: PayrollEntry[];
  isLoading: boolean;
  selectedClientId: string | null;
  onViewPayroll: (payroll: PayrollEntry) => void;
  clientNames?: Record<string, string>;
}

export function PayrollTable({ 
  payrolls, 
  isLoading, 
  selectedClientId, 
  onViewPayroll,
  clientNames = {}
}: PayrollTableProps) {
  
  console.log("PayrollTable rendering with data:", { payrollsCount: payrolls?.length, isLoading });
  
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4">Carregando folhas de pagamento...</p>
        </div>
      );
    }
    
    if (!payrolls || payrolls.length === 0) {
      return (
        <div className="py-8 text-center">
          {selectedClientId 
            ? "Nenhuma folha de pagamento encontrada para este cliente no período selecionado." 
            : "Selecione um cliente para visualizar as folhas de pagamento."
          }
        </div>
      );
    }
    
    return null;
  };

  const getClientNameDisplay = (clientId: string) => {
    return clientNames[clientId] || `Empresa ${clientId.slice(0, 5)}...`;
  };

  if (isLoading || !payrolls || payrolls.length === 0) {
    return <div className="border rounded-md">{renderEmptyState()}</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Funcionários</TableHead>
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
              <TableCell>{getClientNameDisplay(payroll.client_id)}</TableCell>
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
    </div>
  );
}
