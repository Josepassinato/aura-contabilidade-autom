
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlerts } from '@/hooks/useAlerts';

interface ContabilAlertsProps {
  clientId?: string;
  showDismissable?: boolean;
}

export function ContabilAlerts({ clientId, showDismissable = true }: ContabilAlertsProps) {
  const { alerts, acknowledgeAlert } = useAlerts();
  
  // Filtrar alertas de divergências contábeis
  const divergenciaAlerts = alerts.filter(alert => 
    alert.type === 'divergencia' && !alert.isAcknowledged
  );
  
  // Se não houver alertas, não mostrar nada
  if (divergenciaAlerts.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 mb-6">
      {divergenciaAlerts.map((alert) => (
        <Alert key={alert.id} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>{alert.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {alert.actions?.map((action, i) => (
                  <Button 
                    key={i} 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={action.action}
                  >
                    <FileText className="h-4 w-4" />
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
