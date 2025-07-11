import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  X, 
  Eye, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnomalyAlert {
  id: string;
  type: 'revenue_spike' | 'expense_anomaly' | 'duplicate_detection' | 'margin_drop' | 'pattern_break';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  client_name: string;
  detected_at: string;
  confidence: number;
  value?: number;
  expected_value?: number;
  is_read: boolean;
  is_dismissed: boolean;
}

export function AnomalyAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    // Load real alerts from database only
    try {
      // TODO: Replace with real API call to fetch anomaly alerts
      // For now, return empty array until real implementation
      setAlerts([]);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };


  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_dismissed: true } : alert
    ));
    
    toast({
      title: "Alerta Arquivado",
      description: "O alerta foi arquivado com sucesso."
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'revenue_spike': return <TrendingUp className="h-4 w-4" />;
      case 'expense_anomaly': return <TrendingDown className="h-4 w-4" />;
      case 'duplicate_detection': return <FileText className="h-4 w-4" />;
      case 'margin_drop': return <DollarSign className="h-4 w-4" />;
      case 'pattern_break': return <Calendar className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m atrás`;
    } else {
      return 'Agora';
    }
  };

  const filteredAlerts = showDismissed 
    ? alerts 
    : alerts.filter(alert => !alert.is_dismissed);

  const unreadCount = alerts.filter(alert => !alert.is_read && !alert.is_dismissed).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.is_dismissed).length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Anomalias
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} novos
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">
                {criticalCount} críticas
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDismissed(!showDismissed)}
            >
              {showDismissed ? 'Ocultar Arquivados' : 'Mostrar Arquivados'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {showDismissed ? 'Nenhum alerta arquivado.' : 'Nenhuma anomalia detectada!'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  className={`${getSeverityColor(alert.severity)} ${
                    alert.is_dismissed ? 'opacity-60' : ''
                  } ${!alert.is_read ? 'ring-2 ring-orange-200' : ''}`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTitle className="text-sm font-medium">
                            {alert.title}
                          </AlertTitle>
                          <Badge 
                            variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {alert.severity === 'critical' && 'Crítica'}
                            {alert.severity === 'high' && 'Alta'}
                            {alert.severity === 'medium' && 'Média'}
                            {alert.severity === 'low' && 'Baixa'}
                          </Badge>
                          {!alert.is_read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                        <AlertDescription className="text-xs">
                          {alert.message}
                        </AlertDescription>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{alert.client_name}</span>
                          <span>{getTimeAgo(alert.detected_at)}</span>
                          <span>Confiança: {Math.round(alert.confidence * 100)}%</span>
                        </div>
                        {alert.value && alert.expected_value && (
                          <div className="text-xs bg-white/50 p-2 rounded mt-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">Valor:</span>
                                <div className="font-medium">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alert.value)}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Esperado:</span>
                                <div className="font-medium">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alert.expected_value)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!alert.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {!alert.is_dismissed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}