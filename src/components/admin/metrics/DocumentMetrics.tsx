
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { FileText, Check, Clock, AlertCircle } from "lucide-react";

interface DocumentMetricsProps {
  isLoading: boolean;
}

export function DocumentMetrics({ isLoading }: DocumentMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Documentos Totais"
          value="0"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          title="Taxa de Conclusão"
          value="--"
          icon={<Check className="h-5 w-5" />}
        />
        <MetricCard
          title="Tempo de Processamento"
          value="--"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          title="Pendentes"
          value="0"
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Documentos por Tipo</CardTitle>
            <CardDescription>Distribuição de documentos processados por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Dados não disponíveis
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tendência de Documentos</CardTitle>
            <CardDescription>Documentos enviados vs. processados por mês</CardDescription>
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
