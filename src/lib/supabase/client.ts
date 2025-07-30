
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// URLs e chaves do Supabase - usando valores seguros do projeto Lovable
const SUPABASE_URL = "https://watophocqlcyimirzrpe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg";

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
