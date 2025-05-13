
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { Star, Activity, TrendingUp, Clock } from "lucide-react";

interface FeaturesUsageMetricsProps {
  isLoading: boolean;
}

export function FeaturesUsageMetrics({ isLoading }: FeaturesUsageMetricsProps) {
  // Mock data for demonstration
  const featuresData = {
    topFeature: "Obrigações Fiscais",
    averageFeatureUse: 14,
    growthRate: "18.4%",
    featuresByUsage: [
      { name: "Obrigações Fiscais", acessos: 428 },
      { name: "Relatórios Financeiros", acessos: 347 },
      { name: "Documentos", acessos: 302 },
      { name: "Integração Gov", acessos: 238 },
      { name: "Folha de Pagamento", acessos: 196 },
      { name: "Cálculos Fiscais", acessos: 168 },
      { name: "Análises Preditivas", acessos: 104 },
      { name: "Configurações", acessos: 87 }
    ],
    featuresByTime: [
      { name: "Obrigações Fiscais", tempo: 14.2 },
      { name: "Relatórios Financeiros", tempo: 12.5 },
      { name: "Documentos", tempo: 8.4 },
      { name: "Integração Gov", tempo: 16.8 },
      { name: "Folha de Pagamento", tempo: 18.2 }
    ]
  };

  // Colors for charts
  const COLORS = ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6", "#1abc9c", "#34495e", "#e67e22"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Recurso Mais Popular"
          value={featuresData.topFeature}
          icon={<Star className="h-5 w-5" />}
        />
        <MetricCard
          title="Média de Uso por Usuário"
          value={`${featuresData.averageFeatureUse} recursos`}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Taxa de Crescimento"
          value={featuresData.growthRate}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 18.4, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recursos por Número de Acessos</CardTitle>
            <CardDescription>Classificação de recursos por popularidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featuresData.featuresByUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} acessos`, 'Total']} />
                  <Legend />
                  <Bar dataKey="acessos" name="Acessos" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tempo Médio por Recurso</CardTitle>
            <CardDescription>Tempo médio gasto pelos usuários em cada recurso (minutos)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featuresData.featuresByTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} minutos`, 'Tempo Médio']} />
                  <Legend />
                  <Bar dataKey="tempo" name="Tempo Médio (min)" fill="#9b59b6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
