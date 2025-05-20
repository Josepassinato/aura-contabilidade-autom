
import { LogProcuracao } from "./types";
import { fetchProcuracaoLogsFromDb, adicionarLogProcuracaoToDb } from "./procuracaoRepository";

/**
 * Adiciona uma entrada ao log de processamento da procuração
 * @param procuracaoId ID da procuração
 * @param logEntry Entrada de log a ser adicionada
 * @returns Promise indicando sucesso ou falha
 */
export async function adicionarLogProcuracao(
  procuracaoId: string, 
  logEntry: LogProcuracao
): Promise<boolean> {
  try {
    // Buscar procuração atual
    const { data: procuracao, error: fetchError } = await fetchProcuracaoLogsFromDb(procuracaoId);
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Adicionar nova entrada ao log
    const logs = procuracao.log_processamento || [];
    logs.push(JSON.stringify(logEntry));
    
    // Atualizar procuração
    const { error: updateError } = await adicionarLogProcuracaoToDb(procuracaoId, logs);
      
    if (updateError) {
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar log à procuração:', error);
    return false;
  }
}

/**
 * Cria uma entrada de log com a data atual
 * @param acao Ação realizada
 * @param resultado Resultado da ação
 * @param detalhes Detalhes adicionais (opcional)
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
