
import { supabase } from "@/lib/supabase/client";
import { UF } from "./estadualIntegration";
import { 
  verificarProcuracaoParaSefaz, 
  consultarSefazComProcuracao,
  emitirGuiaSefazComProcuracao 
} from "./sefaz/procuracaoIntegracao";
import { ScrapeResult } from "./sefaz/types";
import { toast } from "@/hooks/use-toast";

/**
 * Busca procurações ativas para um cliente
 * @param clientId ID do cliente
 * @param uf UF da SEFAZ (opcional)
 * @returns ID da procuração válida ou null se não encontrar
 */
export async function buscarProcuracaoValidaAutomatica(clientId: string, uf?: UF): Promise<string | null> {
  try {
    // Consulta para buscar procurações válidas
    let query = supabase
      .from('procuracoes_eletronicas')
      .select('id, servicos_autorizados, data_validade')
      .eq('client_id', clientId)
      .eq('status', 'emitida')
      .gt('data_validade', new Date().toISOString())
      .order('data_validade', { ascending: false }) // Usa a mais recente primeiro
      .limit(5);
      
    const { data, error } = await query;
      
    if (error || !data || data.length === 0) {
      console.log("Nenhuma procuração válida encontrada para o cliente", clientId);
      return null;
    }
    
    // Verifica se é para uma UF específica e se tem permissões necessárias
    if (uf) {
      // Encontra a primeira procuração que tem permissões para a UF especificada
      for (const procuracao of data) {
        const checkResult = await verificarProcuracaoParaSefaz(procuracao.id, uf);
        if (checkResult.success) {
          return procuracao.id;
        }
      }
      return null;
    }
    
    // Se não especificar UF, retorna a primeira procuração válida
    return data[0].id;
  } catch (error) {
    console.error("Erro ao buscar procurações automáticas:", error);
    return null;
  }
}

/**
 * Serviço automatizado para consultar SEFAZ usando procuração quando disponível
 * @param clientId ID do cliente
 * @param uf UF da SEFAZ
 * @param operacao Operação a ser realizada
 * @returns Resultado da consulta
 */
export async function consultarSefazAutomatico(
  clientId: string, 
  uf: UF, 
  operacao: string
): Promise<ScrapeResult> {
  try {
    // Tentativa de encontrar procuração válida
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    
    // Se encontrou procuração válida, usa ela para consultar
    if (procuracaoId) {
      console.log(`Usando procuração automática ${procuracaoId} para consulta SEFAZ-${uf}`);
      return await consultarSefazComProcuracao(procuracaoId, uf, operacao);
    }
    
    // Se não encontrou, retorna erro indicando falta de procuração
    return {
      success: false,
      error: `Não foi encontrada procuração eletrônica válida para o cliente com acesso à SEFAZ-${uf}`
    };
  } catch (error) {
    console.error("Erro na consulta automática à SEFAZ:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao consultar SEFAZ"
    };
  }
}

/**
 * Serviço automatizado para emitir guias SEFAZ usando procuração quando disponível
 * @param clientId ID do cliente
 * @param uf UF da SEFAZ
 * @param dadosGuia Dados para emissão da guia
 * @returns Resultado da emissão
 */
export async function emitirGuiaSefazAutomatico(
  clientId: string,
  uf: UF,
  dadosGuia: Record<string, any>
): Promise<ScrapeResult> {
  try {
    // Tentativa de encontrar procuração válida
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    
    // Se encontrou procuração válida, usa ela para emitir guia
    if (procuracaoId) {
      console.log(`Usando procuração automática ${procuracaoId} para emissão de guia SEFAZ-${uf}`);
      return await emitirGuiaSefazComProcuracao(procuracaoId, uf, dadosGuia);
    }
    
    // Se não encontrou, retorna erro indicando falta de procuração
    return {
      success: false,
      error: `Não foi encontrada procuração eletrônica válida para o cliente com permissão para emitir guias na SEFAZ-${uf}`
    };
  } catch (error) {
    console.error("Erro na emissão automática de guia SEFAZ:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao emitir guia SEFAZ"
    };
  }
}

/**
 * Verifica se o cliente possui procuração válida para determinada operação na SEFAZ
 * @param clientId ID do cliente
 * @param uf UF da SEFAZ
 * @returns Objeto indicando se possui procuração e mensagem
 */
export async function verificarDisponibilidadeProcuracaoSefaz(
  clientId: string,
  uf: UF
): Promise<{possui: boolean; mensagem: string;}> {
  try {
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    
    if (procuracaoId) {
      return {
        possui: true,
        mensagem: `Cliente possui procuração eletrônica válida para SEFAZ-${uf}`
      };
    }
    
    return {
      possui: false,
      mensagem: `Cliente não possui procuração eletrônica válida para SEFAZ-${uf}`
    };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade de procuração:", error);
    return {
      possui: false,
      mensagem: `Erro ao verificar procuração para SEFAZ-${uf}`
    };
  }
}
