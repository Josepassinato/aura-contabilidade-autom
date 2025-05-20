
import { ValidacaoProcuracaoResponse } from "./types";
import { fetchProcuracaoPorIdFromDb } from "./procuracaoRepository";
import { atualizarStatusProcuracao } from "./procuracaoService";

/**
 * Valida uma procuração existente
 * @param procuracaoId ID da procuração a ser validada
 * @returns Informações sobre a validade da procuração
 */
export async function validarProcuracao(procuracaoId: string): Promise<ValidacaoProcuracaoResponse> {
  try {
    const { data, error } = await fetchProcuracaoPorIdFromDb(procuracaoId);
      
    if (error) {
      throw error;
    }
    
    const procuracao = data;
    
    if (!procuracao) {
      return {
        status: 'nao_encontrada',
        message: 'Procuração não encontrada'
      };
    }
    
    // Verificar se expirou
    const hoje = new Date();
    const dataValidade = new Date(procuracao.data_validade || '');
    
    if (procuracao.status === 'cancelada') {
      return {
        status: 'invalida',
        message: 'Procuração foi cancelada'
      };
    }
    
    if (hoje > dataValidade || procuracao.status === 'expirada') {
      // Atualizar status se necessário
      if (procuracao.status !== 'expirada') {
        await atualizarStatusProcuracao(procuracaoId, 'expirada');
      }
      
      return {
        status: 'expirada',
        data_validade: procuracao.data_validade,
        message: 'Procuração expirada'
      };
    }
    
    // Calcular dias restantes
    const diasRestantes = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      status: 'valida',
      data_validade: procuracao.data_validade,
      dias_restantes: diasRestantes,
      servicos_autorizados: procuracao.servicos_autorizados,
      message: `Procuração válida por mais ${diasRestantes} dias`
    };
  } catch (error: any) {
    console.error('Erro ao validar procuração:', error);
    return {
      status: 'nao_encontrada',
      message: error.message || 'Erro ao validar procuração'
    };
  }
}
