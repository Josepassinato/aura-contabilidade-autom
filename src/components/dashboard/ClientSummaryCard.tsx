
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
  const statusColors = {
    regular: 'bg-green-100 text-green-800',
    pendente: 'bg-yellow-100 text-yellow-800',
    atrasado: 'bg-red-100 text-red-800'
  };
  
  const statusText = {
    regular: 'Regular',
    pendente: 'Pendências',
    atrasado: 'Atrasado'
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="bg-muted/30 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
              {statusText[status]}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{documentsPending}</span> docs pendentes
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{upcomingDeadlines}</span> prazos próximos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClientSummaryCard;
