import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  components: {
    database: { status: string; response_time: number; };
    queue: { status: string; pending_tasks: number; failed_rate: number; };
    workers: { status: string; active_count: number; avg_response_time: number; };
    automation: { status: string; success_rate: number; error_rate: number; };
  };
  alerts: any[];
}

interface PerformanceMetrics {
  queue: {
    total_tasks: number;
    pending_tasks: number;
    processing_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    avg_processing_time: number;
  };
  automation: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    avg_execution_time: number;
    total_records_processed: number;
  };
  workers: {
    total_workers: number;
    active_workers: number;
    idle_workers: number;
    busy_workers: number;
    total_task_capacity: number;
    current_task_load: number;
  };
  system: {
    timestamp: string;
    uptime: number;
  };
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

export const useRealTimeMonitoring = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const wsUrl = 'wss://watophocqlcyimirzrpe.supabase.co/functions/v1/performance-monitor';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to performance monitoring WebSocket');
        setIsConnected(true);
        setIsLoading(false);
        reconnectAttempts.current = 0;
        
        // Request initial data
        ws.send(JSON.stringify({ type: 'request_metrics' }));
        ws.send(JSON.stringify({ type: 'request_alerts' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'health_update':
              setHealth(message.data);
              
              // Show critical alerts as toasts
              if (message.data.overall_status === 'critical') {
                const criticalAlerts = message.data.alerts.filter((alert: any) => alert.level === 'critical');
                criticalAlerts.forEach((alert: any) => {
                  toast({
                    title: "Alerta Crítico",
                    description: alert.message,
                    variant: "destructive"
                  });
                });
              }
              break;
              
            case 'metrics_update':
              setMetrics(message.data);
              break;
              
            case 'alerts_update':
              setAlerts(message.data);
              
              // Show new alerts as toasts
              message.data.forEach((alert: Alert) => {
                if (alert.level === 'critical' || alert.level === 'warning') {
                  toast({
                    title: alert.level === 'critical' ? "Alerta Crítico" : "Atenção",
                    description: alert.message,
                    variant: alert.level === 'critical' ? "destructive" : "default"
                  });
                }
              });
              break;
              
            case 'optimization_complete':
              toast({
                title: "Otimização Concluída",
                description: `${message.data.optimizations.length} otimizações aplicadas`
              });
              break;
              
            case 'error':
              console.error('WebSocket error:', message.message);
              toast({
                title: "Erro de Monitoramento",
                description: message.message,
                variant: "destructive"
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        websocketRef.current = null;
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        } else {
          toast({
            title: "Conexão Perdida",
            description: "Não foi possível reconectar ao monitoramento em tempo real",
            variant: "destructive"
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsLoading(false);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao monitoramento em tempo real",
        variant: "destructive"
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const requestMetrics = useCallback(() => {
    if (websocketRef.current && isConnected) {
      websocketRef.current.send(JSON.stringify({ type: 'request_metrics' }));
    }
  }, [isConnected]);

  const requestAlerts = useCallback(() => {
    if (websocketRef.current && isConnected) {
      websocketRef.current.send(JSON.stringify({ type: 'request_alerts' }));
    }
  }, [isConnected]);

  const optimizeSystem = useCallback(() => {
    if (websocketRef.current && isConnected) {
      websocketRef.current.send(JSON.stringify({ type: 'optimize_system' }));
      toast({
        title: "Otimização Iniciada",
        description: "Sistema sendo otimizado em tempo real..."
      });
    }
  }, [isConnected, toast]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isLoading,
    health,
    metrics,
    alerts,
    connect,
    disconnect,
    requestMetrics,
    requestAlerts,
    optimizeSystem
  };
};