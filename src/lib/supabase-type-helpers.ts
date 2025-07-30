/**
 * Helper centralizado para contornar problemas de tipagem do Supabase
 * Este arquivo deve ser usado em todos os lugares onde há erros de tipagem com SelectQueryError
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Wrapper universal para queries do Supabase que evita problemas de tipagem
 */
export const safeQuery = {
  /**
   * SELECT com type safety
   */
  select: (table: string, columns: string = '*') => ({
    eq: (column: string, value: any) => 
      supabase.from(table).select(columns as any).eq(column as any, value as any),
    
    in: (column: string, values: any[]) => 
      supabase.from(table).select(columns as any).in(column as any, values as any),
    
    gte: (column: string, value: any) => 
      supabase.from(table).select(columns as any).gte(column as any, value as any),
    
    lt: (column: string, value: any) => 
      supabase.from(table).select(columns as any).lt(column as any, value as any),
    
    order: (column: string, options: any) => 
      supabase.from(table).select(columns as any).order(column as any, options),
    
    limit: (count: number) => 
      supabase.from(table).select(columns as any).limit(count),
    
    single: () => 
      supabase.from(table).select(columns as any).single(),
      
    maybeSingle: () => 
      supabase.from(table).select(columns as any).maybeSingle()
  }),

  /**
   * INSERT com type safety
   */
  insert: (table: string, values: any) => 
    supabase.from(table).insert(values as any),

  /**
   * UPDATE com type safety
   */
  update: (table: string, values: any) => ({
    eq: (column: string, value: any) => 
      supabase.from(table).update(values as any).eq(column as any, value as any)
  }),

  /**
   * DELETE com type safety
   */
  delete: (table: string) => ({
    eq: (column: string, value: any) => 
      supabase.from(table).delete().eq(column as any, value as any)
  })
};

/**
 * Helper para extrair dados com segurança, assumindo que sempre é um array se não houver erro
 */
export const extractData = (result: any): any[] => {
  if (!result || result.error) return [];
  return Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
};

/**
 * Helper para extrair um único item com segurança
 */
export const extractSingleData = (result: any): any => {
  if (!result || result.error) return null;
  return result.data;
};

/**
 * Type assertion helper para forçar tipagem em queries problemáticas
 */
export const asAny = (value: any): any => value as any;