
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueTrend } from '@/services/supabase/businessAnalyticsService';

interface RevenueChartProps {
  data: RevenueTrend[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Receita</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Receita (MRR)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
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
        </div>
      </CardContent>
    </Card>
  );
}
