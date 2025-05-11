
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlerts } from '@/hooks/useAlerts';
import { Badge } from '@/components/ui/badge';

interface FiscalDeadlineAlertsProps {
  showDismissable?: boolean;
}

export function FiscalDeadlineAlerts({ showDismissable = true }: FiscalDeadlineAlertsProps) {
  const { alerts, acknowledgeAlert } = useAlerts();
  
  // Filtrar alertas de prazos fiscais
  const prazoAlerts = alerts.filter(alert => 
    alert.type === 'prazo' && !alert.isAcknowledged
  );
  
  // Se não houver alertas, não mostrar nada
  if (prazoAlerts.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 mb-6">
      {prazoAlerts.map((alert) => (
        <Alert key={alert.id}>
          <Clock className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {alert.title}
            {alert.priority === 'alta' && (
              <Badge variant="destructive" className="ml-2">Urgente</Badge>
            )}
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>{alert.message}</p>
              
              {alert.expirationDate && (
                <p className="text-sm mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Vencimento: {new Date(alert.expirationDate).toLocaleDateString('pt-BR')}
                </p>
              )}
              
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {alert.actions?.map((action, i) => (
                  <Button 
                    key={i} 
                    variant="default" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={action.action}
                  >
                    {action.label}
                  </Button>
                ))}
                
                {showDismissable && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Dispensar
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
