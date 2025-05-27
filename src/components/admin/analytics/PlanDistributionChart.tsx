
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PlanDistribution } from '@/services/supabase/businessAnalyticsService';
import { AlertCircle } from 'lucide-react';

interface PlanDistributionChartProps {
  data: PlanDistribution[];
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];
const PLAN_LABELS: Record<string, string> = {
  'basic': 'Básico',
  'standard': 'Padrão',
  'premium': 'Premium'
};

export function PlanDistributionChart({ data, isLoading = false }: PlanDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Real por Plano</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.length > 0;

  // Prepare data for display with better labels
  const chartData = data.map(item => ({
    ...item,
    name: PLAN_LABELS[item.plan] || item.plan
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Distribuição Real por Plano
          {!hasData && <AlertCircle className="h-4 w-4 text-amber-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {!hasData ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <p>Nenhum plano ativo encontrado</p>
                <p className="text-sm">Ative assinaturas para visualizar a distribuição</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => {
                    const { payload } = props;
                    return [`${value} contabilidades (${payload.percentage.toFixed(1)}%)`, payload.name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
