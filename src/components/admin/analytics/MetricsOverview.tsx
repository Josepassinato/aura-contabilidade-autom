
import React from 'react';
import { MetricCard } from './MetricCard';
import { Building, TrendingUp, DollarSign, Percent, BarChart, AlertCircle } from 'lucide-react';
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

  const hasNoData = metrics.totalFirms === 0 && metrics.monthlyRevenue === 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Contabilidades Ativas (Real)"
        value={metrics.totalFirms}
        icon={hasNoData ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <Building className="h-4 w-4" />}
        trend={metrics.totalFirms > 0 ? { 
          value: metrics.growthRate, 
          isPositive: metrics.growthRate >= 0 
        } : undefined}
        description={hasNoData ? "Nenhuma contabilidade cadastrada" : undefined}
      />
      
      <MetricCard
        title="Taxa de Crescimento (Real)"
        value={Math.abs(metrics.growthRate).toFixed(1)}
        valueSuffix="%"
        icon={hasNoData ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <TrendingUp className="h-4 w-4" />}
        trend={metrics.totalFirms > 0 ? { 
          value: metrics.growthRate, 
          isPositive: metrics.growthRate >= 0 
        } : undefined}
        description={hasNoData ? "Sem dados de crescimento" : "Crescimento mensal"}
      />
      
      <MetricCard
        title="Receita Mensal Real (MRR)"
        value={metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        valuePrefix="R$ "
        icon={hasNoData ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <DollarSign className="h-4 w-4" />}
        description={hasNoData ? "Nenhuma receita registrada" : "Faturamento mensal recorrente"}
      />
      
      <MetricCard
        title="Receita Anual Real (ARR)"
        value={metrics.annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        valuePrefix="R$ "
        icon={hasNoData ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <BarChart className="h-4 w-4" />}
        description={hasNoData ? "Projeção baseada em MRR zero" : "Projeção anual com base no MRR"}
      />
      
      <MetricCard
        title="Receita Média Real por Cliente"
        value={metrics.averageRevenuePerFirm.toFixed(2)}
        valuePrefix="R$ "
        icon={hasNoData ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <Percent className="h-4 w-4" />}
        description={hasNoData ? "Sem clientes ativos" : "Valor médio por contabilidade"}
      />
    </div>
  );
}
