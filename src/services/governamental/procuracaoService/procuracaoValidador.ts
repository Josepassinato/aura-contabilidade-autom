
import { ValidacaoProcuracaoResponse } from "./types";
import { supabase } from "@/lib/supabase/client";

/**
 * Valida uma procuração eletrônica
 * @param procuracaoId ID da procuração ou número da procuração
 * @returns Resultado da validação
 */
export async function validarProcuracao(
  procuracaoId: string
): Promise<ValidacaoProcuracaoResponse> {
  try {
    // Buscar procuração pelo ID, número ou outro identificador
    const { data, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .or(`id.eq.${procuracaoId},procuracao_numero.eq.${procuracaoId}`)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return {
        status: 'nao_encontrada',
        message: 'Procuração não encontrada no sistema'
      };
    }
    
    // Verificar se expirou
    const dataValidade = new Date(data.data_validade);
    const hoje = new Date();
    
    if (dataValidade < hoje) {
      return {
        status: 'expirada',
        message: 'Procuração expirada',
        data_validade: data.data_validade
      };
    }
    
    // Calcular dias restantes
    const diasRestantes = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verificar status
    if (data.status === 'cancelada') {
      return {
        status: 'invalida',
        message: 'Procuração foi cancelada'
      };
    }
    
    if (data.status !== 'emitida') {
      return {
        status: 'invalida',
        message: `Procuração em status: ${data.status}`
      };
    }
    
    // Procuração válida
    return {
      status: 'valida',
      message: 'Procuração válida',
      data_validade: data.data_validade,
      dias_restantes: diasRestantes,
      servicos_autorizados: data.servicos_autorizados
    };
  } catch (error: any) {
    console.error('Erro ao validar procuração:', error);
    return {
      status: 'nao_encontrada',
      message: `Erro ao validar: ${error.message}`
    };
  }
}
