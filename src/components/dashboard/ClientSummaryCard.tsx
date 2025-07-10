
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, AlertCircle, FileCheck, Calendar } from "lucide-react";

interface ClientSummaryProps {
  name: string;
  status: 'regular' | 'pendente' | 'atrasado';
  documentsPending: number;
  upcomingDeadlines: number;
}

export function ClientSummaryCard({ name, status, documentsPending, upcomingDeadlines }: ClientSummaryProps) {
  const statusConfig = {
    regular: {
      color: 'status-success',
      text: 'Regular',
      icon: '✓',
      bgGradient: 'from-success/5 to-success/10'
    },
    pendente: {
      color: 'status-warning',
      text: 'Pendências',
      icon: '⚠',
      bgGradient: 'from-warning/5 to-warning/10'
    },
    atrasado: {
      color: 'status-error',
      text: 'Atrasado',
      icon: '⚡',
      bgGradient: 'from-destructive/5 to-destructive/10'
    }
  };

  const config = statusConfig[status];

  return (
    <Card className={`overflow-hidden border-l-4 border-l-primary interactive-card bg-gradient-to-br ${config.bgGradient}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">{name}</span>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${config.color} flex items-center gap-1 transition-smooth`}>
            <span>{config.icon}</span>
            {config.text}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-smooth">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <FileCheck className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{documentsPending}</div>
              <div className="text-xs text-muted-foreground">documentos</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-smooth">
            <div className="p-1.5 bg-purple-100 rounded-md">
              <Calendar className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{upcomingDeadlines}</div>
              <div className="text-xs text-muted-foreground">prazos</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClientSummaryCard;
