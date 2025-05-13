
// Este arquivo agora serve apenas como re-exportação para compatibilidade com o código existente
// Em futuras atualizações, os imports devem ser migrados para usar @/lib/supabase diretamente

import { supabase, useSupabaseClient } from './supabase/client';
import { supabaseAuth, checkForAuthLimboState } from './supabase/auth';
import { getUserProfile } from './supabase/profiles';

// Re-exportar todos os itens para manter compatibilidade
export {
  supabase,
  supabaseAuth,
  useSupabaseClient,
  getUserProfile,
  checkForAuthLimboState
};
