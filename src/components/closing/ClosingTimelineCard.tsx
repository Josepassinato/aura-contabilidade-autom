import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, Pause, Circle } from 'lucide-react';
import { ClosingStatus } from '@/hooks/useMonthlyClosing';

interface ClosingTimelineCardProps {
  closings: ClosingStatus[];
}

export function ClosingTimelineCard({ closings }: ClosingTimelineCardProps) {
  const getTimelineEvents = () => {
    const events = closings.map(closing => ({
      id: closing.id,
      client_name: closing.client_name,
      status: closing.status,
      timestamp: closing.last_activity,
      progress: closing.validations_total > 0 
        ? (closing.validations_passed / closing.validations_total) * 100 
        : 0
    }));

    // Ordenar por atividade mais recente
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 8); // Mostrar apenas os 8 mais recentes
  };

  const getStatusIcon = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'review':
        return <Pause className="h-4 w-4 text-info" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      case 'blocked':
        return 'bg-destructive text-destructive-foreground';
      case 'review':
        return 'bg-info text-info-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Progresso';
      case 'blocked':
        return 'Bloqueado';
      case 'review':
        return 'Em Revisão';
      default:
        return 'Pendente';
    }
  };

  const timelineEvents = getTimelineEvents();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline de Atividades
        </CardTitle>
        <CardDescription>
          Últimas atividades de fechamento dos clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4">
                {/* Timeline line */}
                <div className="relative flex flex-col items-center">
                  {getStatusIcon(event.status)}
                  {index < timelineEvents.length - 1 && (
                    <div className="w-px h-12 bg-border mt-2" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">
                      {event.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(event.status)}
                    >
                      {getStatusLabel(event.status)}
                    </Badge>
                    {event.status !== 'completed' && event.status !== 'blocked' && (
                      <span className="text-xs text-muted-foreground">
                        {event.progress.toFixed(0)}% concluído
                      </span>
                    )}
                  </div>

                  {event.status !== 'completed' && event.status !== 'blocked' && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${event.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {closings.length > 8 && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  E mais {closings.length - 8} clientes...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}