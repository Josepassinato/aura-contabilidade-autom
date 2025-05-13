
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { Brain, MessageCircle, Zap, Clock } from "lucide-react";
import { useOpenAIConfig } from "@/hooks/useOpenAIConfig";

interface AIAssistantMetricsProps {
  isLoading: boolean;
}

export function AIAssistantMetrics({ isLoading }: AIAssistantMetricsProps) {
  // Get OpenAI usage stats from localStorage
  const getOpenAIStats = () => {
    try {
      const statsJson = localStorage.getItem("openai-usage-stats");
      if (statsJson) {
        return JSON.parse(statsJson);
      }
    } catch (error) {
      console.error("Erro ao obter estatísticas de tokens:", error);
    }
    
    // Return default stats if none found
    return {
      totalTokens: 125482,
      lastReset: new Date().toISOString(),
      requests: 387
    };
  };

  const stats = getOpenAIStats();
  const { isConfigured, config } = useOpenAIConfig();
  
  // Mock data for demonstration
  const aiData = {
    totalQueries: stats.requests || 387,
    tokensUsed: stats.totalTokens || 125482,
    averageResponseTime: "1.8s",
    queriesByHour: [
      { hour: "00:00", queries: 5 },
      { hour: "02:00", queries: 2 },
      { hour: "04:00", queries: 1 },
      { hour: "06:00", queries: 3 },
      { hour: "08:00", queries: 15 },
      { hour: "10:00", queries: 48 },
      { hour: "12:00", queries: 32 },
      { hour: "14:00", queries: 55 },
      { hour: "16:00", queries: 41 },
      { hour: "18:00", queries: 22 },
      { hour: "20:00", queries: 12 },
      { hour: "22:00", queries: 8 }
    ],
    queryTypes: [
      { name: "Fiscal", valor: 142 },
      { name: "Contábil", valor: 98 },
      { name: "Financeiro", valor: 76 },
      { name: "Relatórios", valor: 47 },
      { name: "Outros", valor: 24 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Consultas"
          value={aiData.totalQueries}
          icon={<MessageCircle className="h-5 w-5" />}
          trend={{ value: 12.8, isPositive: true }}
        />
        <MetricCard
          title="Tokens Utilizados"
          value={aiData.tokensUsed.toLocaleString()}
          icon={<Brain className="h-5 w-5" />}
        />
        <MetricCard
          title="Tempo Médio de Resposta"
          value={aiData.averageResponseTime}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 8.4, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Consultas por Hora do Dia</CardTitle>
            <CardDescription>Distribuição de uso do assistente de IA por horário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiData.queriesByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} consultas`, 'Quantidade']} />
                  <Legend />
                  <Bar dataKey="queries" name="Consultas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tipos de Consulta</CardTitle>
            <CardDescription>Categorias mais frequentes de consulta ao assistente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiData.queryTypes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value} consultas`, 'Quantidade']} />
                  <Legend />
                  <Bar dataKey="valor" name="Consultas" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
