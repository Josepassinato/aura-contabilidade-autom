
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleError } from '@/services/errorHandlingService';

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
      
      setAlerts(data || []);
    } catch (error: any) {
      await handleError(error, 'usePaymentAlerts.loadPendingAlerts');
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
      await handleError(error, 'usePaymentAlerts.checkOverduePayments');
      return false;
    }
  };

  const markAlertAsSent = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('payment_alerts')
        .update({ email_sent: true })
        .eq('id', alertId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setAlerts(prev => prev.filter(alert => alert.alert_id !== alertId));
      
      return true;
    } catch (error: any) {
      await handleError(error, 'usePaymentAlerts.markAlertAsSent', false);
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
