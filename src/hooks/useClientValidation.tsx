import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useClientValidation() {
  const [hasClients, setHasClients] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const { toast } = useToast();

  const checkClients = async () => {
    try {
      setIsLoading(true);
      const { data, error, count } = await supabase
        .from('accounting_clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) {
        console.error('Erro ao verificar clientes:', error);
        return;
      }

      const totalClients = count || 0;
      setClientCount(totalClients);
      setHasClients(totalClients > 0);
    } catch (error) {
      console.error('Erro ao verificar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCanProceed = () => {
    if (!hasClients) {
      toast({
        title: "Ação necessária",
        description: "Você precisa adicionar pelo menos um cliente antes de continuar.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const confirmSkipStep = () => {
    toast({
      title: "Confirmar ação",
      description: "Tem certeza que deseja pular a adição de clientes? Você pode adicionar depois.",
    });
    return true;
  };

  useEffect(() => {
    checkClients();
  }, []);

  return {
    hasClients,
    clientCount,
    isLoading,
    checkClients,
    validateCanProceed,
    confirmSkipStep
  };
}