
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessMetrics } from '@/services/supabase/businessAnalyticsService';
import { AlertCircle } from 'lucide-react';

interface RetentionMetricsProps {
  metrics: BusinessMetrics;
  isLoading?: boolean;
}

export function RetentionMetrics({ metrics, isLoading = false }: RetentionMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas Reais de Retenção</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <div className="h-full w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const hasData = metrics.totalFirms > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Métricas Reais de Retenção
          {!hasData && <AlertCircle className="h-4 w-4 text-amber-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p>Sem dados de retenção</p>
              <p className="text-sm">Adicione assinaturas para calcular métricas</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Taxa de Retenção (Real)</div>
                <div className="text-sm font-medium text-green-600">{metrics.retentionRate.toFixed(1)}%</div>
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(metrics.retentionRate, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Taxa de Cancelamento (Real)</div>
                <div className="text-sm font-medium text-red-600">{metrics.churnRate.toFixed(1)}%</div>
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(metrics.churnRate, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2">
              Baseado em {metrics.totalFirms} contabilidades reais cadastradas no sistema
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
