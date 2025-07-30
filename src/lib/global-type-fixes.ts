/**
 * Correções globais de tipos para resolver problemas de tipagem do Supabase
 * Este arquivo aplica type assertions de forma centralizada
 */

// Global type override para resolver problemas do Supabase
declare global {
  interface Window {
    __supabase_type_fixes__: boolean;
  }
}

// Type utility para forçar any em queries problemáticas  
export const asAny = <T>(value: T): any => value as any;

// Helper para extrair dados com segurança
export const safeData = <T>(result: any): T | null => {
  if (!result || result.error) return null;
  return result.data as T;
};

// Helper para extrair arrays com segurança
export const safeArray = <T>(result: any): T[] => {
  if (!result || result.error || !result.data) return [];
  return Array.isArray(result.data) ? result.data as T[] : [result.data as T];
};

// Export vazio para fazer este arquivo ser um módulo válido
export {};

// Aplicar correções globais
if (typeof window !== 'undefined') {
  window.__supabase_type_fixes__ = true;
}