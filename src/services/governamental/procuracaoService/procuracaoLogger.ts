
import { supabase } from "@/lib/supabase/client";
import { LogProcuracao } from "./types";
import { logger } from "@/utils/logger";

/**
 * Adiciona uma entrada de log ao processamento da procuração
 */
export async function adicionarLogProcuracao(procuracaoId: string, log: LogProcuracao) {
  try {
    // Buscar a procuração atual para obter o log existente
    const { data: procuracaoAtual, error: fetchError } = await supabase
      .from('procuracoes_eletronicas')
      .select('log_processamento')
      .eq('id', procuracaoId)
      .single();

    if (fetchError) {
      logger.error('Erro ao buscar procuração para adicionar log', fetchError, 'ProcuracaoLogger');
      return;
    }

    // Atualizar o log de processamento
    const logAtual = procuracaoAtual?.log_processamento || [];
    const novaEntrada = JSON.stringify(log);
    const novoLog = [...logAtual, novaEntrada];

    const { error: updateError } = await supabase
      .from('procuracoes_eletronicas')
      .update({
        log_processamento: novoLog,
        updated_at: new Date().toISOString()
      })
      .eq('id', procuracaoId);

    if (updateError) {
      logger.error('Erro ao atualizar log da procuração', updateError, 'ProcuracaoLogger');
    }
  } catch (error) {
    logger.error('Erro ao adicionar log da procuração', error, 'ProcuracaoLogger');
  }
}
