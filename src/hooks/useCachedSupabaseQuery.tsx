import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';

type FetchFunction<TData = any> = () => Promise<{ data: TData | null; error: PostgrestError | null }>;

// Estratégias de cache baseadas no tipo de consulta
export const CacheStrategies = {
  // Para dados estáticos ou que mudam raramente (ex: configurações, planos de conta)
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  
  // Para dados de referência que mudam ocasionalmente (ex: lista de clientes, empresas contábeis)
  REFERENCE: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  },
  
  // Para dados operacionais com atualizações moderadas (ex: documentos, relatórios)
  OPERATIONAL: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  
  // Para dados dinâmicos que mudam frequentemente (ex: status de processamento, notificações)
  DYNAMIC: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  
  // Para dados críticos que precisam estar sempre atualizados (ex: alertas de sistema)
  REALTIME: {
    staleTime: 0, // Sempre considera stale
    gcTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Atualiza a cada 1 minuto
  }
} as const;

export type CacheStrategy = keyof typeof CacheStrategies;

interface CachedSupabaseQueryOptions<TData, TError, TQueryKey extends QueryKey> {
  queryKey: TQueryKey;
  queryFn: FetchFunction<TData>;
  strategy: CacheStrategy;
  customOptions?: Omit<UseQueryOptions<{ data: TData | null; error: PostgrestError | null }, TError, { data: TData | null; error: PostgrestError | null }, TQueryKey>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook otimizado para consultas do Supabase com estratégias de cache pré-definidas
 */
export function useCachedSupabaseQuery<
  TData = any,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey
>({
  queryKey,
  queryFn,
  strategy,
  customOptions = {}
}: CachedSupabaseQueryOptions<TData, TError, TQueryKey>) {
  const cacheConfig = CacheStrategies[strategy];
  
  return useQuery<
    { data: TData | null; error: PostgrestError | null },
    TError,
    { data: TData | null; error: PostgrestError | null },
    TQueryKey
  >({
    queryKey,
    queryFn,
    ...cacheConfig,
    ...customOptions, // Permite override das configurações padrão se necessário
  });
}

/**
 * Hook específico para consultas de dados estáticos
 */
export function useStaticQuery<TData = any, TError = Error, TQueryKey extends QueryKey = QueryKey>(
  queryKey: TQueryKey,
  queryFn: FetchFunction<TData>,
  options?: Omit<UseQueryOptions<{ data: TData | null; error: PostgrestError | null }, TError, { data: TData | null; error: PostgrestError | null }, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  return useCachedSupabaseQuery({
    queryKey,
    queryFn,
    strategy: 'STATIC',
    customOptions: options
  });
}

/**
 * Hook específico para consultas de dados de referência
 */
export function useReferenceQuery<TData = any, TError = Error, TQueryKey extends QueryKey = QueryKey>(
  queryKey: TQueryKey,
  queryFn: FetchFunction<TData>,
  options?: Omit<UseQueryOptions<{ data: TData | null; error: PostgrestError | null }, TError, { data: TData | null; error: PostgrestError | null }, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  return useCachedSupabaseQuery({
    queryKey,
    queryFn,
    strategy: 'REFERENCE',
    customOptions: options
  });
}

/**
 * Hook específico para consultas de dados operacionais
 */
export function useOperationalQuery<TData = any, TError = Error, TQueryKey extends QueryKey = QueryKey>(
  queryKey: TQueryKey,
  queryFn: FetchFunction<TData>,
  options?: Omit<UseQueryOptions<{ data: TData | null; error: PostgrestError | null }, TError, { data: TData | null; error: PostgrestError | null }, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  return useCachedSupabaseQuery({
    queryKey,
    queryFn,
    strategy: 'OPERATIONAL',
    customOptions: options
  });
}

/**
 * Utility para invalidar cache baseado em padrões de chave
 */
export const invalidateQueryPattern = (queryClient: any, pattern: string[]) => {
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      return pattern.every((part, index) => 
        query.queryKey[index] === part || part === '*'
      );
    }
  });
};

/**
 * Utility para pré-carregar dados frequentemente acessados
 */
export const prefetchFrequentData = async (queryClient: any) => {
  // Lista de queries frequentes para pré-carregamento
  const frequentQueries = [
    ['accounting_firms'], // Lista de empresas contábeis
    ['user_profiles'], // Perfis de usuário
    ['plano_contas'], // Plano de contas
    ['centro_custos'], // Centro de custos
  ];
  
  // Implementar pré-carregamento quando necessário
  // Aqui seria onde as queries específicas seriam executadas
};