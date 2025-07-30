/**
 * Helper functions para contornar problemas de tipagem do Supabase
 * Este arquivo centraliza as correções de tipos que são necessárias
 * devido a incompatibilidades entre os tipos gerados pelo Supabase
 * e o TypeScript strict mode
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Wrapper seguro para queries do Supabase que força tipos any quando necessário
 */
export const safeSupabaseQuery = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      ...supabase.from(table).select(columns as any),
      eq: (column: string, value: any) => supabase.from(table).select(columns as any).eq(column as any, value as any),
      in: (column: string, values: any[]) => supabase.from(table).select(columns as any).in(column as any, values as any),
      order: (column: string, options: any) => supabase.from(table).select(columns as any).order(column as any, options),
      limit: (count: number) => supabase.from(table).select(columns as any).limit(count),
    }),
    insert: (values: any) => supabase.from(table).insert(values as any),
    update: (values: any) => ({
      ...supabase.from(table).update(values as any),
      eq: (column: string, value: any) => supabase.from(table).update(values as any).eq(column as any, value as any),
    }),
    delete: () => ({
      eq: (column: string, value: any) => supabase.from(table).delete().eq(column as any, value as any),
    }),
  }),
  
  rpc: (fn: string, args?: any) => supabase.rpc(fn as any, args),
  
  functions: {
    invoke: (name: string, options?: any) => supabase.functions.invoke(name, options),
  },
};

/**
 * Type-safe wrapper para resultados de queries
 */
export const processQueryResult = <T>(data: any, fallback: T): T => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data as T;
  return data as T;
};

/**
 * Helper para mapear dados do Supabase com type safety
 */
export const mapSupabaseData = <T>(data: any, mapper: (item: any) => T): T[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(mapper);
};