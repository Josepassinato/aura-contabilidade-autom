
import { LogProcuracao } from "./types";
import { supabase } from "@/lib/supabase/client";

/**
 * Cria uma entrada de log para a procuração
 * @param acao Ação realizada
 * @param resultado Resultado da ação
 * @param detalhes Detalhes adicionais
 * @returns Objeto LogProcuracao formatado
 */
export function criarLogProcuracao(
  acao: string,
  resultado: string,
  detalhes?: Record<string, any>
): LogProcuracao {
  return {
    timestamp: new Date().toISOString(),
    acao,
    resultado,
    detalhes
  };
}

/**
 * Adiciona um log ao registro da procuração
 * @param procuracaoId ID da procuração
 * @param logEntry Entrada de log a ser adicionada
 */
export async function adicionarLogProcuracao(
  procuracaoId: string,
  logEntry: LogProcuracao
): Promise<boolean> {
  try {
    // Buscar logs atuais
    const { data: procuracao, error: fetchError } = await supabase
      .from('procuracoes_eletronicas')
      .select('log_processamento')
      .eq('id', procuracaoId)
      .single();
      
    if (fetchError) {
      console.error('Erro ao buscar logs da procuração:', fetchError);
      return false;
    }
    
    // Preparar array de logs (existentes + novo)
    const logs = procuracao.log_processamento || [];
    logs.push(JSON.stringify(logEntry));
    
    // Atualizar registro com novo log
    const { error: updateError } = await supabase
      .from('procuracoes_eletronicas')
      .update({ log_processamento: logs })
      .eq('id', procuracaoId);
      
    if (updateError) {
      console.error('Erro ao salvar log da procuração:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar log à procuração:', error);
    return false;
  }
}
