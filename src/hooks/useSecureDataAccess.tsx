import { useAuth } from '@/contexts/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para garantir acesso seguro aos dados baseado no papel do usuário
 */
export const useSecureDataAccess = () => {
  const { userProfile, isAuthenticated } = useAuth();

  // Função para validar se o usuário pode acessar dados de um cliente específico
  const validateClientAccess = useCallback(async (clientId: string): Promise<boolean> => {
    if (!isAuthenticated || !userProfile) {
      return false;
    }

    // Admins podem acessar qualquer cliente
    if (userProfile.role === 'admin') {
      return true;
    }

    // Contadores só podem acessar clientes associados a eles
    if (userProfile.role === 'accountant') {
      try {
        const { data } = await supabase
          .from('accounting_clients')
          .select('id')
          .eq('id', clientId)
          .eq('accountant_id', userProfile.id)
          .maybeSingle();
        
        return !!data;
      } catch {
        return false;
      }
    }

    // Clientes só podem acessar dados da própria empresa
    if (userProfile.role === 'client') {
      return userProfile.company_id === clientId;
    }

    return false;
  }, [isAuthenticated, userProfile]);

  // Função segura para buscar dados de clientes
  const getSecureClientQuery = useCallback(() => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    // Usar a função RPC que já aplica filtros de segurança baseados no role
    return supabase.rpc('get_accountant_clients');
  }, [isAuthenticated, userProfile]);

  // Função segura para buscar relatórios
  const getSecureReportsQuery = useCallback((clientId?: string) => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('generated_reports')
      .select(`
        *,
        accounting_clients (
          id,
          name,
          accounting_firms (
            name,
            cnpj,
            phone,
            email
          )
        )
      `);

    // Se for cliente, filtrar apenas relatórios da própria empresa
    if (userProfile.role === 'client') {
      if (!userProfile.company_id) {
        throw new Error('Cliente não possui empresa associada');
      }
      query = query.eq('client_id', userProfile.company_id);
    } else if (clientId && userProfile.role !== 'admin') {
      // Para contadores, se especificado um cliente, validar acesso
      query = query.eq('client_id', clientId);
    }

    return query;
  }, [isAuthenticated, userProfile]);

  // Função segura para buscar documentos
  const getSecureDocumentsQuery = useCallback((clientId?: string) => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('client_documents')
      .select('*');

    // Se for cliente, filtrar apenas documentos da própria empresa
    if (userProfile.role === 'client') {
      if (!userProfile.company_id) {
        throw new Error('Cliente não possui empresa associada');
      }
      query = query.eq('client_id', userProfile.company_id);
    } else if (clientId && userProfile.role !== 'admin') {
      // Para contadores, se especificado um cliente, validar acesso
      query = query.eq('client_id', clientId);
    }

    return query;
  }, [isAuthenticated, userProfile]);

  // Função para validar e executar operações seguras
  const executeSecureOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    errorMessage: string = 'Operação não autorizada'
  ): Promise<T | null> => {
    try {
      if (!isAuthenticated || !userProfile) {
        toast({
          title: 'Erro de Autenticação',
          description: 'Você precisa estar logado para executar esta operação',
          variant: 'destructive'
        });
        return null;
      }

      return await operation();
    } catch (error) {
      console.error('Erro na operação segura:', error);
      toast({
        title: 'Erro de Segurança',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  }, [isAuthenticated, userProfile]);

  // Função para verificar se usuário pode gerar relatórios
  const canGenerateReports = useCallback((): boolean => {
    return userProfile?.role === 'accountant' || userProfile?.role === 'admin';
  }, [userProfile]);

  // Função para verificar se usuário pode gerenciar clientes
  const canManageClients = useCallback((): boolean => {
    return userProfile?.role === 'accountant' || userProfile?.role === 'admin';
  }, [userProfile]);

  return {
    validateClientAccess,
    getSecureClientQuery,
    getSecureReportsQuery,
    getSecureDocumentsQuery,
    executeSecureOperation,
    canGenerateReports,
    canManageClients,
    userProfile,
    isAuthenticated,
    currentUserId: userProfile?.id,
    currentCompanyId: userProfile?.company_id,
    userRole: userProfile?.role
  };
};