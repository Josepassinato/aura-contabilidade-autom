
import { useState, useCallback } from 'react';
import { useQuery, useMutation, UseQueryOptions, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Cliente React Query centralizado
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 segundos
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

// Provedor para o React Query
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Hook para consultas otimizadas ao Supabase
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options?: Omit<UseQueryOptions<{ data: T | null; error: PostgrestError | null }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

// Hook para mutações com tratamento padronizado de erros e feedback
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData | null; error: PostgrestError | null }>,
  options?: {
    onSuccess?: (data: { data: TData | null; error: PostgrestError | null }) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Erro",
          description: options?.errorMessage || result.error.message,
          variant: "destructive",
        });
        options?.onError?.(new Error(result.error.message));
      } else if (options?.successMessage) {
        toast({
          title: "Sucesso",
          description: options.successMessage,
        });
        options?.onSuccess?.(result);
      } else {
        options?.onSuccess?.(result);
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: options?.errorMessage || error.message,
        variant: "destructive",
      });
      options?.onError?.(error);
    }
  });
}

// Hook exemplo para tabela de clientes
export function useClients(enabled = true) {
  return useSupabaseQuery(
    ['clients'],
    async () => {
      const { data, error } = await supabase
        .from('accounting_clients')
        .select('*')
        .order('name');
      
      return { data, error };
    },
    {
      enabled,
      onError: (error) => {
        console.error('Erro ao buscar clientes:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: "Não foi possível carregar a lista de clientes",
          variant: "destructive",
        });
      }
    }
  );
}

// Hook para tentar novamente operações que falharam
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<{ result: T | null; error: Error | null; success: boolean }> => {
    setIsRetrying(true);
    
    try {
      let attempts = 0;
      let lastError: Error | null = null;
      
      while (attempts < maxRetries) {
        try {
          const result = await operation();
          setRetryCount(0);
          setIsRetrying(false);
          return { result, error: null, success: true };
        } catch (error) {
          attempts++;
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(`Tentativa ${attempts}/${maxRetries} falhou:`, error);
          setRetryCount(attempts);
          
          if (attempts < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      setIsRetrying(false);
      return { result: null, error: lastError, success: false };
    } catch (error) {
      setIsRetrying(false);
      const finalError = error instanceof Error ? error : new Error(String(error));
      return { result: null, error: finalError, success: false };
    }
  }, []);
  
  return { retry, retryCount, isRetrying };
}
