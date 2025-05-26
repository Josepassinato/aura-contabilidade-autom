
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { Star, Activity, TrendingUp } from "lucide-react";

interface FeaturesUsageMetricsProps {
  isLoading: boolean;
}

export function FeaturesUsageMetrics({ isLoading }: FeaturesUsageMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Recurso Mais Popular"
          value="--"
          icon={<Star className="h-5 w-5" />}
        />
        <MetricCard
          title="Média de Uso por Usuário"
          value="0"
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Taxa de Crescimento"
          value="--"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recursos por Número de Acessos</CardTitle>
            <CardDescription>Classificação de recursos por popularidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Dados não disponíveis
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tempo Médio por Recurso</CardTitle>
            <CardDescription>Tempo médio gasto pelos usuários em cada recurso (minutos)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Dados não disponíveis
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
