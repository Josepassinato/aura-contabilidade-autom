
import { supabase } from "@/lib/supabase/client";
import { ProcuracaoEletronica } from "./types";

/**
 * Valida se uma procuração está ativa e dentro da validade
 */
export async function validarProcuracaoAtiva(procuracaoId: string): Promise<{
  valida: boolean;
  mensagem: string;
  procuracao?: ProcuracaoEletronica;
}> {
  try {
    const { data: procuracao, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('id', procuracaoId)
      .single();

    if (error || !procuracao) {
      return {
        valida: false,
        mensagem: 'Procuração não encontrada'
      };
    }

    const agora = new Date();
    const dataValidade = new Date(procuracao.data_validade);

    if (procuracao.status !== 'emitida') {
      return {
        valida: false,
        mensagem: `Procuração com status: ${procuracao.status}`,
        procuracao
      };
    }

    if (dataValidade <= agora) {
      return {
        valida: false,
        mensagem: 'Procuração expirada',
        procuracao
      };
    }

    return {
      valida: true,
      mensagem: 'Procuração válida e ativa',
      procuracao
    };
  } catch (error: any) {
    return {
      valida: false,
      mensagem: `Erro na validação: ${error.message}`
    };
  }
}

/**
 * Valida se um cliente possui procuração válida para um estado específico
 */
export async function validarProcuracaoParaEstado(
  clientId: string, 
  uf: string
): Promise<{
  valida: boolean;
  mensagem: string;
  procuracaoId?: string;
}> {
  try {
    const { data: procuracoes, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'emitida');

    if (error) {
      throw error;
    }

    if (!procuracoes || procuracoes.length === 0) {
      return {
        valida: false,
        mensagem: `Nenhuma procuração encontrada para o estado ${uf}`
      };
    }

    const agora = new Date();
    const procuracaoValida = procuracoes.find(p => {
      const dataValidade = new Date(p.data_validade);
      return dataValidade > agora && 
             p.servicos_autorizados.some((servico: string) => 
               servico.includes('SEFAZ') || servico.includes(uf)
             );
    });

    if (!procuracaoValida) {
      return {
        valida: false,
        mensagem: `Nenhuma procuração válida para SEFAZ-${uf}`
      };
    }

    return {
      valida: true,
      mensagem: 'Procuração válida encontrada',
      procuracaoId: procuracaoValida.id
    };
  } catch (error: any) {
    return {
      valida: false,
      mensagem: `Erro na validação: ${error.message}`
    };
  }
}
