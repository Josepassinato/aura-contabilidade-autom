
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessMetrics } from '@/services/supabase/businessAnalyticsService';

interface RetentionMetricsProps {
  metrics: BusinessMetrics;
  isLoading?: boolean;
}

export function RetentionMetrics({ metrics, isLoading = false }: RetentionMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Retenção</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <div className="h-full w-full bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Retenção</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Taxa de Retenção</div>
              <div className="text-sm font-medium text-green-600">{metrics.retentionRate.toFixed(1)}%</div>
            </div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${metrics.retentionRate}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Taxa de Cancelamento</div>
              <div className="text-sm font-medium text-red-600">{metrics.churnRate.toFixed(1)}%</div>
            </div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${metrics.churnRate}%` }}
              />
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2">
            Baseado em {metrics.totalFirms} contabilidades cadastradas no sistema
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
