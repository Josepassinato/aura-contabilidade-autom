
// Re-export do serviço centralizado do Supabase
import { supabase } from '@/lib/supabase/client';
import type { Database } from './types';

// Exportando o cliente já configurado
export { supabase };
