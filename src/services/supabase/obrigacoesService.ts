
import { supabase } from "@/integrations/supabase/client";
import { Obrigacao } from "@/types/obrigacoes";

/**
 * Busca todas as obrigações fiscais de um cliente
 * @param clientId ID do cliente (opcional)
 */
export async function fetchObrigacoesFiscais(clientId?: string): Promise<Obrigacao[]> {
  try {
    console.log('Iniciando busca de obrigações fiscais...');
    
    let query = supabase.from('obrigacoes_fiscais').select('*');
    
    // Filtrar por cliente se o ID for fornecido
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('prazo');
    
    if (error) {
      console.error('Erro ao buscar obrigações fiscais:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhuma obrigação fiscal encontrada');
      return [];
    }
    
    return data.map(item => ({
      id: item.id, // ID agora pode ser string (UUID) ou número
      nome: item.nome,
      tipo: item.tipo,
      prazo: item.prazo,
      empresa: item.empresa,
      status: item.status as "pendente" | "atrasado" | "concluido",
      prioridade: item.prioridade as "baixa" | "media" | "alta"
    }));
    
  } catch (error) {
    console.error('Erro ao buscar obrigações fiscais:', error);
    return [];
  }
}

/**
 * Adiciona uma nova obrigação fiscal
 */
export async function adicionarObrigacaoFiscal(obrigacao: Omit<Obrigacao, "id">): Promise<Obrigacao | null> {
  try {
    const { data, error } = await supabase
      .from('obrigacoes_fiscais')
      .insert(obrigacao)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar obrigação fiscal:', error);
      return null;
    }
    
    return {
      id: data.id,
      nome: data.nome,
      tipo: data.tipo,
      prazo: data.prazo,
      empresa: data.empresa,
      status: data.status as "pendente" | "atrasado" | "concluido",
      prioridade: data.prioridade as "baixa" | "media" | "alta"
    };
    
  } catch (error) {
    console.error('Erro ao adicionar obrigação fiscal:', error);
    return null;
  }
}

/**
 * Atualiza o status de uma obrigação fiscal
 */
export async function atualizarStatusObrigacao(
  id: number | string, 
  status: "pendente" | "atrasado" | "concluido"
): Promise<boolean> {
  try {
    // Converter o id para string caso seja um número, já que o Supabase espera string para o id
    const idAsString = id.toString();
    
    const { error } = await supabase
      .from('obrigacoes_fiscais')
      .update({ status })
      .eq('id', idAsString);
    
    if (error) {
      console.error('Erro ao atualizar status da obrigação fiscal:', error);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Erro ao atualizar status da obrigação fiscal:', error);
    return false;
  }
}
