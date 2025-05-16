
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from '../../hooks/usePayrollGenerator';

interface PayrollDetailsProps {
  payrollData: any;
  benefits: any[];
  deductions: any[];
}

export function PayrollDetails({ payrollData, benefits, deductions }: PayrollDetailsProps) {
  return (
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
  );
}
