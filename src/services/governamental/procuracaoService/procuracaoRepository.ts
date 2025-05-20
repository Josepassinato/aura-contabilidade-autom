
import { supabase } from "@/lib/supabase/client";
import { ProcuracaoEletronica, LogProcuracao } from "./types";

/**
 * Busca procurações eletrônicas de um cliente
 * @param clientId ID do cliente
 * @returns Promise com as procurações ou erro
 */
export async function fetchProcuracoesFromDb(clientId: string) {
  const { data, error } = await supabase
    .from('procuracoes_eletronicas')
    .select('*')
    .eq('client_id', clientId);
    
  return { data, error };
}

/**
 * Busca uma procuração eletrônica específica por ID
 * @param procuracaoId ID da procuração
 * @returns Promise com a procuração ou erro
 */
export async function fetchProcuracaoPorIdFromDb(procuracaoId: string) {
  return await supabase
    .from('procuracoes_eletronicas')
    .select('*')
    .eq('id', procuracaoId)
    .single();
}

/**
 * Insere uma nova procuração no banco de dados
 * @param procuracao Dados da procuração a ser inserida
 * @returns Promise com a procuração criada ou erro
 */
export async function insertProcuracaoToDb(procuracao: ProcuracaoEletronica) {
  return await supabase
    .from('procuracoes_eletronicas')
    .insert(procuracao)
    .select()
    .single();
}

/**
 * Atualiza o status de uma procuração
 * @param procuracaoId ID da procuração
 * @param status Novo status
 * @returns Promise com resultado da operação
 */
export async function updateProcuracaoStatusInDb(
  procuracaoId: string,
  status: ProcuracaoEletronica['status']
) {
  return await supabase
    .from('procuracoes_eletronicas')
    .update({ status })
    .eq('id', procuracaoId);
}

/**
 * Adiciona uma entrada ao log de processamento da procuração
 * @param procuracaoId ID da procuração
 * @param logEntry Entrada de log a ser adicionada
 */
export async function adicionarLogProcuracaoToDb(
  procuracaoId: string, 
  logs: string[]
) {
  return await supabase
    .from('procuracoes_eletronicas')
    .update({ log_processamento: logs })
    .eq('id', procuracaoId);
}

/**
 * Busca os logs de uma procuração
 * @param procuracaoId ID da procuração
 * @returns Promise com os logs ou erro
 */
export async function fetchProcuracaoLogsFromDb(procuracaoId: string) {
  return await supabase
    .from('procuracoes_eletronicas')
    .select('log_processamento')
    .eq('id', procuracaoId)
    .single();
}

/**
 * Invoca a função edge para processar a procuração
 * @param procuracaoId ID da procuração a ser processada
 */
export async function invocarProcessamentoProcuracao(procuracaoId: string) {
  return await supabase.functions.invoke('processar-procuracao', {
    body: { procuracaoId }
  });
}
