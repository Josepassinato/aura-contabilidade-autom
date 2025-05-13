
import React from 'react';
import { MetricCard } from './MetricCard';
import { Building, TrendingUp, DollarSign, Percent, BarChart } from 'lucide-react';
import { BusinessMetrics } from '@/services/supabase/businessAnalyticsService';

interface MetricsOverviewProps {
  metrics: BusinessMetrics;
  isLoading?: boolean;
}

export function MetricsOverview({ metrics, isLoading = false }: MetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Contabilidades Ativas"
        value={metrics.totalFirms}
        icon={<Building className="h-4 w-4" />}
        trend={{ 
          value: metrics.growthRate, 
          isPositive: metrics.growthRate >= 0 
        }}
      />
      
      <MetricCard
        title="Taxa de Crescimento"
        value={Math.abs(metrics.growthRate).toFixed(1)}
        valueSuffix="%"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ 
          value: metrics.growthRate, 
          isPositive: metrics.growthRate >= 0 
        }}
        description="Crescimento mensal"
      />
      
      <MetricCard
        title="Receita Mensal (MRR)"
        value={metrics.monthlyRevenue}
        valuePrefix="R$ "
        icon={<DollarSign className="h-4 w-4" />}
        description="Faturamento mensal recorrente"
      />
      
      <MetricCard
        title="Receita Anual (ARR)"
        value={metrics.annualRevenue}
        valuePrefix="R$ "
        icon={<BarChart className="h-4 w-4" />}
        description="Projeção anual com base no MRR"
      />
      
      <MetricCard
        title="Receita Média por Cliente"
        value={metrics.averageRevenuePerFirm.toFixed(2)}
        valuePrefix="R$ "
        icon={<Percent className="h-4 w-4" />}
        description="Valor médio por contabilidade"
      />
    </div>
  );
}
