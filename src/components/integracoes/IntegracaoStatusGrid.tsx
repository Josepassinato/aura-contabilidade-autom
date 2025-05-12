
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GanttChart } from "lucide-react";
import { IntegracaoStatus, IntegracaoEstadualStatus } from './IntegracaoStatus';

interface IntegracaoStatusGridProps {
  integracoes: IntegracaoEstadualStatus[];
}

export function IntegracaoStatusGrid({ integracoes }: IntegracaoStatusGridProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GanttChart className="h-5 w-5 text-primary" />
          <CardTitle>Status das Integrações</CardTitle>
        </div>
        <CardDescription>
          Visualize o status atual das integrações com as SEFAZs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integracoes.map((integracao) => (
            <IntegracaoStatus key={integracao.id} integracao={integracao} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
