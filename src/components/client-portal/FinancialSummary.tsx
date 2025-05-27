
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const loadFinancialData = async () => {
      if (!clientId) return;

      setIsLoading(true);
      try {
        // Buscar dados financeiros reais do cliente
        // Como não temos uma tabela específica de dados financeiros ainda,
        // vamos mostrar valores zerados até que seja implementada
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
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialData();
  }, [clientId]);

  return (
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
  );
};
