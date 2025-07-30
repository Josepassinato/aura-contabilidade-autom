import { useAuth } from '@/contexts/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { SecurityService, ClientsQueryService, ReportsQueryService, DocumentsQueryService } from '@/services';

/**
 * Hook para garantir acesso seguro aos dados baseado no papel do usuário
 */
export const useSecureDataAccess = () => {
  const { userProfile, isAuthenticated } = useAuth();

  // Função para validar se o usuário pode acessar dados de um cliente específico
  const validateClientAccess = useCallback((clientId: string): boolean => {
    if (!isAuthenticated || !userProfile) {
      return false;
    }

    // Admins e contadores podem acessar qualquer cliente
    if (userProfile.role === 'admin' || userProfile.role === 'accountant') {
      return true;
    }

    // Clientes só podem acessar dados da própria empresa
    if (userProfile.role === 'client') {
      return userProfile.company_id === clientId;
    }

    return false;
  }, [isAuthenticated, userProfile]);

  // Função segura para buscar dados de clientes
  const getSecureClientData = useCallback(async () => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    // Se for cliente, buscar apenas sua empresa
    if (userProfile.role === 'client') {
      if (!userProfile.company_id) {
        throw new Error('Cliente não possui empresa associada');
      }
      return await ClientsQueryService.getClientById(userProfile.company_id);
    }
    
    // Contadores e admins podem ver todos os clientes
    if (userProfile.role === 'accountant') {
      return await ClientsQueryService.getAccountantClients(userProfile.id);
    }
    
    // Admins veem todos
    return await ClientsQueryService.getAllClients();
  }, [isAuthenticated, userProfile]);

  // Função segura para buscar relatórios
  const getSecureReportsData = useCallback(async (clientId?: string) => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    // Se for cliente, filtrar apenas relatórios da própria empresa
    if (userProfile.role === 'client') {
      if (!userProfile.company_id) {
        throw new Error('Cliente não possui empresa associada');
      }
      return await ReportsQueryService.getClientReports(userProfile.company_id);
    }
    
    // Para contadores e admins
    if (clientId) {
      return await ReportsQueryService.getClientReports(clientId);
    }
    
    // Todos os relatórios para admins
    return await ReportsQueryService.getAllReports();
  }, [isAuthenticated, userProfile]);

  // Função segura para buscar documentos
  const getSecureDocumentsData = useCallback(async (clientId?: string) => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    // Se for cliente, filtrar apenas documentos da própria empresa
    if (userProfile.role === 'client') {
      if (!userProfile.company_id) {
        throw new Error('Cliente não possui empresa associada');
      }
      return await DocumentsQueryService.getClientDocuments(userProfile.company_id);
    }
    
    // Para contadores e admins
    if (clientId) {
      return await DocumentsQueryService.getClientDocuments(clientId);
    }
    
    // Todos os documentos para admins
    return await DocumentsQueryService.getAllDocuments();
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
    getSecureClientData,
    getSecureReportsData,
    getSecureDocumentsData,
    executeSecureOperation,
    canGenerateReports,
    canManageClients,
    userProfile,
    isAuthenticated,
    currentUserId: userProfile?.id,
    currentCompanyId: userProfile?.company_id,
    userRole: userProfile?.role,
    // Compatibilidade com versões antigas
    getSecureClientQuery: () => supabase.from('accounting_clients').select('*'),
    getSecureReportsQuery: () => supabase.from('generated_reports').select('*'),
    getSecureDocumentsQuery: () => supabase.from('client_documents').select('*')
  };
};