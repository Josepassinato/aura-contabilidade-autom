
import { supabase } from "@/lib/supabase/client";
import { ProcuracaoEletronica, EmitirProcuracaoParams } from "./types";

/**
 * Emite uma nova procuração eletrônica
 */
export async function emitirProcuracao(params: EmitirProcuracaoParams) {
  try {
    console.log('Iniciando emissão de procuração com parâmetros:', params);
    
    // Validar se client_id é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.client_id)) {
      throw new Error(`client_id deve ser um UUID válido. Recebido: ${params.client_id}`);
    }

    // Validar CPF
    const cpfLimpo = params.procurador_cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      throw new Error('CPF do procurador deve ter 11 dígitos');
    }

    // Calcular data de validade
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + params.validade_dias);

    // Dados para inserção
    const dadosProcuracao = {
      client_id: params.client_id, // Já validado como UUID
      certificado_id: params.certificado_id,
      procurador_cpf: cpfLimpo,
      procurador_nome: params.procurador_nome.trim(),
      servicos_autorizados: params.servicos_autorizados,
      data_validade: dataValidade.toISOString(),
      status: 'pendente' as const,
      data_emissao: new Date().toISOString(),
      log_processamento: [`${new Date().toISOString()}: Procuração iniciada`]
    };

    console.log('Dados da procuração para inserção:', dadosProcuracao);

    const { data, error } = await supabase
      .from('procuracoes_eletronicas')
      .insert(dadosProcuracao)
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar procuração eletrônica:', error);
      throw new Error(`Erro ao salvar procuração: ${error.message}`);
    }

    console.log('Procuração cadastrada com sucesso:', data);

    // Simular processamento (em produção seria chamada para API real)
    setTimeout(async () => {
      try {
        await atualizarStatusProcuracao(data.id, 'emitida', 'Procuração emitida com sucesso');
      } catch (err) {
        console.error('Erro ao atualizar status da procuração:', err);
      }
    }, 2000);

    return {
      success: true,
      data: data as ProcuracaoEletronica
    };

  } catch (error: any) {
    console.error('Erro na emissão de procuração:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao emitir procuração'
    };
  }
}

/**
 * Atualiza o status de uma procuração
 */
async function atualizarStatusProcuracao(
  procuracaoId: string,
  novoStatus: ProcuracaoEletronica['status'],
  mensagem: string
) {
  try {
    const { error } = await supabase
      .from('procuracoes_eletronicas')
      .update({
        status: novoStatus,
        log_processamento: supabase.sql`array_append(log_processamento, ${mensagem})`,
        updated_at: new Date().toISOString()
      })
      .eq('id', procuracaoId);

    if (error) {
      throw error;
    }

    console.log(`Status da procuração ${procuracaoId} atualizado para: ${novoStatus}`);
  } catch (error) {
    console.error('Erro ao atualizar status da procuração:', error);
    throw error;
  }
}

/**
 * Busca procurações de um cliente
 */
export async function fetchProcuracoes(clientId: string) {
  try {
    console.log('Buscando procurações para cliente:', clientId);
    
    // Validar se client_id é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clientId)) {
      throw new Error(`client_id deve ser um UUID válido. Recebido: ${clientId}`);
    }

    const { data, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar procurações:', error);
      throw error;
    }

    console.log(`Encontradas ${data?.length || 0} procurações para o cliente`);

    return {
      success: true,
      data: data as ProcuracaoEletronica[]
    };
  } catch (error: any) {
    console.error('Erro ao buscar procurações:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar procurações'
    };
  }
}

/**
 * Valida uma procuração específica
 */
export async function validarProcuracao(procuracaoId: string) {
  try {
    const { data, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('id', procuracaoId)
      .single();

    if (error) {
      throw error;
    }

    const procuracao = data as ProcuracaoEletronica;
    const agora = new Date();
    const dataValidade = new Date(procuracao.data_validade);

    if (procuracao.status === 'emitida' && dataValidade > agora) {
      return {
        status: 'valida' as const,
        message: 'Procuração válida e ativa'
      };
    } else if (dataValidade <= agora) {
      // Atualizar status para expirada
      await atualizarStatusProcuracao(procuracaoId, 'expirada', 'Procuração expirada automaticamente');
      
      return {
        status: 'expirada' as const,
        message: 'Procuração expirada'
      };
    } else {
      return {
        status: 'invalida' as const,
        message: `Procuração com status: ${procuracao.status}`
      };
    }
  } catch (error: any) {
    console.error('Erro ao validar procuração:', error);
    return {
      status: 'erro' as const,
      message: error.message || 'Erro ao validar procuração'
    };
  }
}
