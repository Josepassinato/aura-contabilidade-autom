
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// URLs e chaves do Supabase - obrigatórias via variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Configuração explícita da instância do cliente Supabase
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Exportar cliente centralizado
export const useSupabaseClient = () => {
  return supabase;
};
