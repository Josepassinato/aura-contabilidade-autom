
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyGrowth } from '@/services/supabase/businessAnalyticsService';
import { AlertCircle } from 'lucide-react';

interface GrowthChartProps {
  data: MonthlyGrowth[];
  isLoading?: boolean;
}

export function GrowthChart({ data, isLoading = false }: GrowthChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Clientes (Dados Reais)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some(item => item.firms > 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Crescimento de Clientes (Dados Reais)
          {!hasData && <AlertCircle className="h-4 w-4 text-amber-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {!hasData ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <p>Nenhum dado real de crescimento disponível</p>
                <p className="text-sm">Adicione clientes para visualizar o crescimento</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} contabilidades`, 'Total']} 
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="firms" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Contabilidades"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
