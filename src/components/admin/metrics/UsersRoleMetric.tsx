
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { UserCheck, Users, Clock } from "lucide-react";

interface UsersRoleMetricProps {
  isLoading: boolean;
}

export function UsersRoleMetric({ isLoading }: UsersRoleMetricProps) {
  // Mock data for demonstration
  const userData = {
    totalUsers: 86,
    activeUsers: 72,
    averageSessionTime: "24 min",
    usersByRole: [
      { name: "Contadores", value: 28, color: "#3498db" },
      { name: "Clientes", value: 44, color: "#2ecc71" },
      { name: "Administradores", value: 8, color: "#e74c3c" },
      { name: "Outros", value: 6, color: "#f1c40f" }
    ]
  };

  const COLORS = ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Usuários"
          value={userData.totalUsers}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Usuários Ativos"
          value={userData.activeUsers}
          icon={<UserCheck className="h-5 w-5" />}
          trend={{ value: 5.3, isPositive: true }}
        />
        <MetricCard
          title="Tempo Médio de Sessão"
          value={userData.averageSessionTime}
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userData.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} usuários`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividade de Usuários</CardTitle>
            <CardDescription>Tendência de atividade de usuários nas últimas 4 semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {/* This would be a line chart showing user activity over time */}
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Gráfico de atividade de usuários por data
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
