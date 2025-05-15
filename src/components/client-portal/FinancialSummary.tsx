
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

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
    // Carregar dados financeiros do cliente
    const loadFinancialData = async () => {
      setIsLoading(true);
      try {
        // Em um cenário real, aqui seria feita uma chamada à API para buscar os dados
        // Por enquanto, vamos simular com dados baseados no clientId para tornar dinâmico
        const clientIdNum = parseInt(clientId.replace(/\D/g, '').substring(0, 5) || '0');
        
        // Gerar valores baseados no ID do cliente para simular dados reais e variados
        const baseRevenue = 65000 + (clientIdNum * 234) % 45000;
        const baseExpenses = baseRevenue * (0.3 + (clientIdNum % 10) / 100);
        const baseProfit = baseRevenue - baseExpenses;
        const baseTaxesDue = baseProfit * 0.15;
        
        // Formatar para exibição como valores monetários brasileiros
        const formatter = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        
        setData({
          revenue: formatter.format(baseRevenue),
          expenses: formatter.format(baseExpenses),
          profit: formatter.format(baseProfit),
          taxesDue: formatter.format(baseTaxesDue)
        });
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      loadFinancialData();
    }
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
