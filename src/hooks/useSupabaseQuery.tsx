
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutos padrão
      gcTime: 15 * 60 * 1000, // 15 minutos padrão (garbage collection time)
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

type FetchFunction<TData = any> = () => Promise<{ data: TData | null; error: PostgrestError | null }>;

interface RetryResult<T = any> {
  result: T | null;
  error: Error | null;
  success: boolean;
}

export function useRetry() {
  const retry = async <T,>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<RetryResult<T>> => {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries < maxRetries) {
      try {
        const result = await fn();
        return { result, error: null, success: true };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retries++;
        
        if (retries >= maxRetries) break;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, retries - 1)));
      }
    }

    return { result: null, error: lastError, success: false };
  };

  return { retry };
}

export function useSupabaseQuery<
  TData = any,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: FetchFunction<TData>,
  options?: Omit<UseQueryOptions<{ data: TData | null; error: PostgrestError | null }, TError, { data: TData | null; error: PostgrestError | null }, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<
    { data: TData | null; error: PostgrestError | null },
    TError,
    { data: TData | null; error: PostgrestError | null },
    TQueryKey
  >({
    queryKey,
    queryFn,
    ...options
  });
}
