
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueTrend } from '@/services/supabase/businessAnalyticsService';
import { AlertCircle } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueTrend[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Receita Real (MRR)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some(item => item.revenue > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tendência de Receita Real (MRR)
          {!hasData && <AlertCircle className="h-4 w-4 text-amber-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {!hasData ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <p>Nenhuma receita real registrada</p>
                <p className="text-sm">Adicione assinaturas ativas para visualizar receitas</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`R$${value.toLocaleString()}`, 'Receita']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#22c55e" 
                  name="Receita Mensal"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
