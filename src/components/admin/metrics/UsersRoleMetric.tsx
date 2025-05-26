
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { UserCheck, Users, Clock } from "lucide-react";

interface UsersRoleMetricProps {
  isLoading: boolean;
}

export function UsersRoleMetric({ isLoading }: UsersRoleMetricProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Usuários"
          value="0"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Usuários Ativos"
          value="0"
          icon={<UserCheck className="h-5 w-5" />}
        />
        <MetricCard
          title="Tempo Médio de Sessão"
          value="--"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Usuários por Função</CardTitle>
            <CardDescription>Distribuição de usuários por tipo de perfil no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Dados não disponíveis
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividade de Usuários</CardTitle>
            <CardDescription>Tendência de atividade de usuários nas últimas 4 semanas</CardDescription>
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
