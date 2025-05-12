
import { supabase } from "@/integrations/supabase/client";
import { Obrigacao } from "@/types/obrigacoes";

/**
 * Busca todas as obrigações fiscais de um cliente
 * @param clientId ID do cliente (opcional)
 */
export async function fetchObrigacoesFiscais(clientId?: string): Promise<Obrigacao[]> {
  try {
    let query = supabase.from('obrigacoes_fiscais').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('prazo');
    
    if (error) {
      console.error('Erro ao buscar obrigações fiscais:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(obrigacao => ({
      ...obrigacao,
      status: obrigacao.status as "pendente" | "atrasado" | "concluido",
      prioridade: obrigacao.prioridade as "baixa" | "media" | "alta"
    })) as Obrigacao[];
  } catch (error) {
    console.error('Erro ao buscar obrigações fiscais:', error);
    return [];
  }
}
