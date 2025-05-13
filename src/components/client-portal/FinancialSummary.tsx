
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  clientId: string;
}

export const FinancialSummary = ({ clientId }: FinancialSummaryProps) => {
  const [data, setData] = useState({
    revenue: 'R$ 85.432,18',
    expenses: 'R$ 42.765,90',
    profit: 'R$ 42.666,28',
    taxesDue: 'R$ 12.814,83'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Receita (mês atual)</p>
            <p className="text-xl font-medium">{data.revenue}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesas (mês atual)</p>
            <p className="text-xl font-medium">{data.expenses}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lucro</p>
            <p className="text-xl font-medium text-green-600">{data.profit}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Impostos a pagar</p>
            <p className="text-xl font-medium text-amber-600">{data.taxesDue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
