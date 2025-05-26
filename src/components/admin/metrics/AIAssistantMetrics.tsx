
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { Brain, MessageCircle, Zap, Clock } from "lucide-react";

interface AIAssistantMetricsProps {
  isLoading: boolean;
}

export function AIAssistantMetrics({ isLoading }: AIAssistantMetricsProps) {
  // Em produção, aqui seriam obtidas as estatísticas reais de uso da IA
  const getOpenAIStats = () => {
    return {
      totalTokens: 0,
      totalCost: 0,
      totalQueries: 0,
      averageResponseTime: 0
    };
  };

  const stats = getOpenAIStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Consultas Totais"
          value={stats.totalQueries.toString()}
          icon={<MessageCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="Tokens Consumidos"
          value={stats.totalTokens.toLocaleString()}
          icon={<Brain className="h-5 w-5" />}
        />
        <MetricCard
          title="Custo Total"
          value={`$${stats.totalCost.toFixed(2)}`}
          icon={<Zap className="h-5 w-5" />}
        />
        <MetricCard
          title="Tempo Médio"
          value={`${stats.averageResponseTime}ms`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Uso da IA por Período</CardTitle>
            <CardDescription>Consultas realizadas ao assistente de IA ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Dados não disponíveis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Consultas</CardTitle>
            <CardDescription>Distribuição das consultas por categoria</CardDescription>
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
