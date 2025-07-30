
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentAlert {
  alert_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  alert_type: string;
  payment_due_date: string;
  days_until_due: number;
  alert_sent_date: string;
}

export function usePaymentAlerts() {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadPendingAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pending_payment_alerts');
      
      if (error) throw error;
      
      setAlerts((data || []) as any);
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os alertas de pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkOverduePayments = async () => {
    try {
      const { error } = await supabase.rpc('check_overdue_payments');
      
      if (error) throw error;
      
      toast({
        title: 'Verificação concluída',
        description: 'Verificação de pagamentos em atraso executada com sucesso.',
      });
      
      await loadPendingAlerts();
      return true;
    } catch (error: any) {
      console.error('Erro ao verificar pagamentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao executar verificação de pagamentos.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAlertAsSent = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('payment_alerts')
        .update({ email_sent: true } as any)
        .eq('id', alertId as any);
      
      if (error) throw error;
      
      // Atualizar estado local
      setAlerts(prev => prev.filter(alert => alert.alert_id !== alertId));
      
      return true;
    } catch (error: any) {
      console.error('Erro ao marcar alerta como enviado:', error);
      return false;
    }
  };

  useEffect(() => {
    loadPendingAlerts();
  }, []);

  return {
    alerts,
    isLoading,
    loadPendingAlerts,
    checkOverduePayments,
    markAlertAsSent,
  };
}
