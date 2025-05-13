
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { FileText, Check, Clock, AlertCircle } from "lucide-react";

interface DocumentMetricsProps {
  isLoading: boolean;
}

export function DocumentMetrics({ isLoading }: DocumentMetricsProps) {
  // Mock data for demonstration
  const docData = {
    totalDocuments: 426,
    processedDocuments: 385,
    processingTime: "2.4 min",
    documentsByType: [
      { name: "Notas Fiscais", quantidade: 187 },
      { name: "Recibos", quantidade: 92 },
      { name: "Extratos", quantidade: 64 },
      { name: "Contratos", quantidade: 45 },
      { name: "Outros", quantidade: 38 }
    ],
    documentTrend: [
      { month: "Jan", uploads: 32, processed: 30 },
      { month: "Fev", uploads: 38, processed: 35 },
      { month: "Mar", uploads: 44, processed: 42 },
      { month: "Abr", uploads: 42, processed: 39 },
      { month: "Mai", uploads: 36, processed: 34 },
      { month: "Jun", uploads: 45, processed: 43 }
    ]
  };

  // Calculate completion rate
  const completionRate = ((docData.processedDocuments / docData.totalDocuments) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Documentos Totais"
          value={docData.totalDocuments}
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          icon={<Check className="h-5 w-5" />}
          trend={{ value: 2.5, isPositive: true }}
        />
        <MetricCard
          title="Tempo de Processamento"
          value={docData.processingTime}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 12.3, isPositive: true }}
        />
        <MetricCard
          title="Pendentes"
          value={(docData.totalDocuments - docData.processedDocuments).toString()}
          icon={<AlertCircle className="h-5 w-5" />}
          trend={{ value: 1.2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Documentos por Tipo</CardTitle>
            <CardDescription>Distribuição de documentos processados por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={docData.documentsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} documentos`, 'Quantidade']} />
                  <Legend />
                  <Bar dataKey="quantidade" name="Documentos" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tendência de Documentos</CardTitle>
            <CardDescription>Documentos enviados vs. processados por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={docData.documentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uploads" name="Enviados" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="processed" name="Processados" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
