
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, WifiOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { getDemoData, isDemoMode } from '@/data/demoData';

interface FinancialSummaryProps {
  clientId: string;
}

interface FinancialData {
  revenue: string;
  expenses: string;
  profit: string;
  taxesDue: string;
}

export const FinancialSummary = ({ clientId }: FinancialSummaryProps) => {
  const [data, setData] = useState<FinancialData>({
    revenue: 'R$ 0,00',
    expenses: 'R$ 0,00',
    profit: 'R$ 0,00',
    taxesDue: 'R$ 0,00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInDemoMode, setIsInDemoMode] = useState(false);

  useEffect(() => {
    const loadFinancialData = async () => {
      if (!clientId) return;

      setIsLoading(true);
      
      // Verificar se estamos em modo demo
      if (isDemoMode()) {
        setIsInDemoMode(true);
        const demoData = getDemoData();
        const transactions = demoData.transactions || [];
        
        // Calcular métricas dos dados demo
        const revenues = transactions.filter(t => t.type === 'receita');
        const expenses = transactions.filter(t => t.type === 'despesa');
        
        const totalRevenue = revenues.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
        const profit = totalRevenue - totalExpenses;
        const taxesDue = totalRevenue * 0.08; // Simulação de 8% de impostos
        
        const formatter = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        
        setData({
          revenue: formatter.format(totalRevenue),
          expenses: formatter.format(totalExpenses),
          profit: formatter.format(profit),
          taxesDue: formatter.format(taxesDue)
        });
        
        setIsLoading(false);
        return;
      }
      
      // Como a tabela financial_transactions não existe ainda, mostrar zeros por padrão
      const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      
      setData({
        revenue: formatter.format(0),
        expenses: formatter.format(0),
        profit: formatter.format(0),
        taxesDue: formatter.format(0)
      });
      
      setIsLoading(false);
    };

    loadFinancialData();
  }, [clientId]);

  return (
    <div className="space-y-4">
      {/* Modo demo alert */}
      {isInDemoMode && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Exibindo dados financeiros de demonstração.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumo Financeiro {isLoading && <small>(carregando...)</small>}
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
    </div>
  );
};
