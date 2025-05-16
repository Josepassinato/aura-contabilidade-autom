
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPeriod } from '../../hooks/usePayrollGenerator';

interface PayrollSummaryProps {
  payrollData: any;
}

export function PayrollSummary({ payrollData }: PayrollSummaryProps) {
  return (
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
  );
}
