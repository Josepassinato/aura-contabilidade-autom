
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle } from "lucide-react";

interface ObligationEvent {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: 'pendente' | 'atrasado' | 'concluído';
  priority: 'alta' | 'média' | 'baixa';
}

interface FiscalCalendarProps {
  events: ObligationEvent[];
}

export function FiscalCalendar({ events }: FiscalCalendarProps) {
  const statusColor = {
    pendente: 'bg-yellow-100 text-yellow-800',
    atrasado: 'bg-red-100 text-red-800',
    concluído: 'bg-green-100 text-green-800',
  };

  const priorityIcon = {
    alta: '🔴',
    média: '🟠',
    baixa: '🟢',
  };
  
  // Agrupar eventos por data
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.dueDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ObligationEvent[]>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Calendário Fiscal</CardTitle>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(groupedEvents).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma obrigação fiscal pendente.
            </p>
          ) : (
            Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date} className="mb-4">
                <h4 className="text-sm font-medium border-b pb-1 mb-2">{date}</h4>
                <div className="space-y-2">
                  {dateEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="mr-1">{priorityIcon[event.priority]}</span>
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4">
                          {event.client}
                        </span>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${statusColor[event.status]}`}>
                        {event.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FiscalCalendar;
