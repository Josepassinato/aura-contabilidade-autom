
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

export type AlertType = 'prazo' | 'divergencia' | 'documento' | 'fiscal' | 'info';
export type AlertPriority = 'alta' | 'media' | 'baixa';

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  priority: AlertPriority;
  date: string;
  expirationDate?: string;
  relatedId?: string;
  isAcknowledged: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  // Verificar se temos dados contábeis reais antes de mostrar alertas de divergência
  // Definimos como false para garantir que não apareçam alertas de divergência sem dados reais
  const hasAccountingData = false; 

  // Busca de alertas
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Em um ambiente real, você buscaria do seu backend
        // await api.get('/alerts')
        
        // Simulação de dados - agora só mostra alertas de divergência se houver dados contábeis
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockAlerts: Alert[] = [
          {
            id: '1',
            title: 'DCTF vence em 3 dias',
            message: 'A Declaração de Débitos e Créditos Tributários Federais precisa ser enviada até 15/05/2025.',
            type: 'prazo',
            priority: 'alta',
            date: new Date().toISOString(),
            expirationDate: new Date(2025, 4, 15).toISOString(),
            isAcknowledged: false,
            actions: [
              {
                label: 'Ver detalhes',
                action: () => window.location.href = '/obrigacoes-fiscais'
              }
            ]
          }
        ];
        
        // Só adiciona o alerta de divergência contábil se houver dados contábeis
        if (hasAccountingData) {
          mockAlerts.push({
            id: '2',
            title: 'Divergência encontrada em lançamentos contábeis',
            message: 'Foram identificadas divergências entre os lançamentos contábeis e extratos bancários do cliente Tech Solutions.',
            type: 'divergencia',
            priority: 'alta',
            date: new Date().toISOString(),
            isAcknowledged: false,
            actions: [
              {
                label: 'Analisar',
                action: () => window.location.href = '/analises-preditivas'
              }
            ]
          });
        }
        
        // Adicione outros alertas de tipos diferentes conforme necessário
        mockAlerts.push({
          id: '3',
          title: 'Documentos pendentes de análise',
          message: 'Existem 5 documentos fiscais pendentes de análise do cliente XYZ Comércio S.A.',
          type: 'documento',
          priority: 'media',
          date: new Date(Date.now() - 86400000).toISOString(),
          isAcknowledged: true
        });
        
        setAlerts(mockAlerts);
      } catch (err) {
        console.error('Erro ao buscar alertas:', err);
        setError('Não foi possível carregar os alertas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Adicionar um novo alerta
  const addAlert = (alert: Omit<Alert, 'id' | 'date' | 'isAcknowledged'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      isAcknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Mostrar um toast para alertas de alta prioridade
    if (alert.priority === 'alta') {
      toast({
        title: alert.title,
        description: alert.message,
        variant: "destructive",
      });
    }

    return newAlert.id;
  };

  // Marcar alerta como reconhecido
  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isAcknowledged: true } : alert
      )
    );
  };

  // Remover um alerta
  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Filtrar alertas por tipo
  const filterAlertsByType = (type: AlertType) => {
    return alerts.filter(alert => alert.type === type);
  };

  // Filtrar alertas por prioridade
  const filterAlertsByPriority = (priority: AlertPriority) => {
    return alerts.filter(alert => alert.priority === priority);
  };

  // Obter alertas não reconhecidos
  const getUnacknowledgedAlerts = () => {
    return alerts.filter(alert => !alert.isAcknowledged);
  };

  return {
    alerts,
    loading,
    error,
    addAlert,
    acknowledgeAlert,
    removeAlert,
    filterAlertsByType,
    filterAlertsByPriority,
    getUnacknowledgedAlerts
  };
}
