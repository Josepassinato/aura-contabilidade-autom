import { useQueryClient } from '@tanstack/react-query';
import { invalidateQueryPattern } from './useCachedSupabaseQuery';

/**
 * Hook para gerenciar cache de forma centralizada
 */
export function useCacheManager() {
  const queryClient = useQueryClient();

  // Invalidar cache de clientes
  const invalidateClientsCache = () => {
    invalidateQueryPattern(queryClient, ['clients', '*']);
  };

  // Invalidar cache de documentos
  const invalidateDocumentsCache = () => {
    invalidateQueryPattern(queryClient, ['documents', '*']);
  };

  // Invalidar cache de relatórios
  const invalidateReportsCache = () => {
    invalidateQueryPattern(queryClient, ['reports', '*']);
  };

  // Invalidar cache de um cliente específico
  const invalidateClientCache = (clientId: string) => {
    invalidateQueryPattern(queryClient, ['client', clientId]);
    invalidateQueryPattern(queryClient, ['clients', '*', clientId]);
    invalidateQueryPattern(queryClient, ['documents', 'client', clientId]);
    invalidateQueryPattern(queryClient, ['reports', 'client', clientId]);
  };

  // Limpar todo o cache
  const clearAllCache = () => {
    queryClient.clear();
  };

  // Remover queries inativas do cache
  const removeInactiveQueries = () => {
    queryClient.removeQueries({
      type: 'inactive',
    });
  };

  // Pré-carregar dados frequentes
  const prefetchFrequentData = async () => {
    try {
      // Pré-carregar dados que provavelmente serão acessados
      await queryClient.prefetchQuery({
        queryKey: ['accounting_firms'],
        staleTime: 30 * 60 * 1000, // 30 minutos
      });
    } catch (error) {
      console.warn('Erro ao pré-carregar dados:', error);
    }
  };

  // Invalidar cache baseado em tipo de operação
  const invalidateCacheByOperation = (operation: 'create' | 'update' | 'delete', entity: string, entityId?: string) => {
    switch (entity) {
      case 'client':
        if (entityId) {
          invalidateClientCache(entityId);
        } else {
          invalidateClientsCache();
        }
        break;
      case 'document':
        invalidateDocumentsCache();
        break;
      case 'report':
        invalidateReportsCache();
        break;
      default:
        console.warn('Tipo de entidade não reconhecido para invalidação de cache:', entity);
    }
  };

  // Estatísticas do cache
  const getCacheStats = () => {
    const queries = queryClient.getQueryCache().getAll();
    const total = queries.length;
    const stale = queries.filter(query => query.isStale()).length;
    const active = queries.filter(query => query.getObserversCount() > 0).length;
    
    return {
      total,
      stale,
      active,
      inactive: total - active,
      fresh: total - stale,
    };
  };

  return {
    // Invalidação específica
    invalidateClientsCache,
    invalidateDocumentsCache,
    invalidateReportsCache,
    invalidateClientCache,
    
    // Invalidação por operação
    invalidateCacheByOperation,
    
    // Limpeza geral
    clearAllCache,
    removeInactiveQueries,
    
    // Pré-carregamento
    prefetchFrequentData,
    
    // Estatísticas
    getCacheStats,
  };
}