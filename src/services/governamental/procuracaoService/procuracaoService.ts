
import { toast } from "@/hooks/use-toast";
import { 
  ProcuracaoEletronica, 
  ProcuracaoResponse, 
  EmissaoProcuracaoParams
} from "./types";
import { fetchCertificadosDigitais } from "../certificadosDigitaisService";
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchProcuracoesFromDb, 
  fetchProcuracaoPorIdFromDb, 
  insertProcuracaoToDb,
  updateProcuracaoStatusInDb,
  invocarProcessamentoProcuracao
} from "./procuracaoRepository";
import { adicionarLogProcuracao, criarLogProcuracao } from "./procuracaoLogger";
import { validarProcuracao } from "./procuracaoValidador";
import { uploadProcuracaoDocument } from "./procuracaoStorage";
import { supabase } from "@/lib/supabase/client"; // Add proper import for supabase

// Re-exporte o validador para manter compatibilidade com código existente
export { validarProcuracao };

/**
 * Busca procurações eletrônicas de um cliente
 * @param clientId ID do cliente
 * @returns Promise com as procurações
 */
export async function fetchProcuracoes(clientId: string): Promise<ProcuracaoResponse> {
  try {
    const { data, error } = await fetchProcuracoesFromDb(clientId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data as ProcuracaoEletronica[]
    };
  } catch (error: any) {
    console.error('Erro ao buscar procurações eletrônicas:', error);
    return {
      success: false,
      error: error.message || "Não foi possível buscar as procurações eletrônicas"
    };
  }
}

/**
 * Busca uma procuração eletrônica específica por ID
 * @param procuracaoId ID da procuração
 * @returns Promise com a procuração
 */
export async function fetchProcuracaoPorId(procuracaoId: string): Promise<ProcuracaoResponse> {
  try {
    const { data, error } = await fetchProcuracaoPorIdFromDb(procuracaoId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data as ProcuracaoEletronica
    };
  } catch (error: any) {
    console.error('Erro ao buscar procuração eletrônica:', error);
    return {
      success: false,
      error: error.message || "Não foi possível buscar a procuração eletrônica"
    };
  }
}

/**
 * Inicia o processo de emissão de procuração eletrônica
 * @param params Parâmetros para emissão da procuração
 * @returns Promise com o resultado da operação
 */
export async function emitirProcuracao(params: EmissaoProcuracaoParams): Promise<ProcuracaoResponse> {
  try {
    // Verificar se o certificado existe
    const certificadosResponse = await fetchCertificadosDigitais(params.client_id);
    
    if (!certificadosResponse.success || !certificadosResponse.data) {
      throw new Error("Não foi possível encontrar certificados para o cliente");
    }
    
    const certificado = certificadosResponse.data.find(c => c.id === params.certificado_id);
    
    if (!certificado) {
      throw new Error("Certificado não encontrado");
    }
    
    // Calcular data de validade (hoje + dias especificados)
    const dataEmissao = new Date().toISOString();
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + params.validade_dias);
    
    // Criar registro inicial da procuração
    const novaProcuracao: ProcuracaoEletronica = {
      id: uuidv4(),
      client_id: params.client_id,
      procurador_cpf: params.procurador_cpf,
      procurador_nome: params.procurador_nome,
      servicos_autorizados: params.servicos_autorizados,
      certificado_id: params.certificado_id,
      status: 'pendente',
      data_emissao: dataEmissao,
      data_validade: dataValidade.toISOString(),
      log_processamento: [
        JSON.stringify(criarLogProcuracao(
          'INICIADO',
          'Processo de emissão iniciado',
          { validade_dias: params.validade_dias }
        ))
      ]
    };
    
    // Salvar no banco de dados
    const { data, error } = await insertProcuracaoToDb(novaProcuracao);
      
    if (error) {
      throw error;
    }
    
    // Enfileirar processo de emissão
    try {
      await invocarProcessamentoProcuracao(novaProcuracao.id!);
    } catch (funcError) {
      // Adicionar log de erro mas não falhar completamente
      console.warn("Erro ao enfileirar processamento da procuração:", funcError);
      
      // Adicionar log de erro à procuração
      await adicionarLogProcuracao(novaProcuracao.id!, 
        criarLogProcuracao(
          'ENFILEIRAMENTO',
          'ERRO',
          { erro: (funcError as Error).message }
        )
      );
    }
    
    toast({
      title: "Procuração iniciada",
      description: "A procuração foi iniciada e está em processamento",
    });
    
    return {
      success: true,
      data: data as ProcuracaoEletronica,
      message: "Procuração em processamento"
    };
  } catch (error: any) {
    console.error('Erro ao emitir procuração eletrônica:', error);
    
    toast({
      title: "Erro ao emitir procuração",
      description: error.message || "Não foi possível emitir a procuração eletrônica",
      variant: "destructive"
    });
    
    return {
      success: false,
      error: error.message || "Erro ao emitir procuração eletrônica"
    };
  }
}

/**
 * Atualiza o status de uma procuração
 * @param procuracaoId ID da procuração
 * @param status Novo status
 * @param detalhes Detalhes adicionais (opcional)
 */
export async function atualizarStatusProcuracao(
  procuracaoId: string,
  status: ProcuracaoEletronica['status'],
  detalhes?: Record<string, any>
): Promise<boolean> {
  try {
    // Atualizar status
    const { error } = await updateProcuracaoStatusInDb(procuracaoId, status);
      
    if (error) {
      throw error;
    }
    
    // Adicionar log de atualização
    await adicionarLogProcuracao(
      procuracaoId, 
      criarLogProcuracao(
        'ATUALIZAR_STATUS',
        `Status atualizado para ${status}`,
        detalhes
      )
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da procuração:', error);
    return false;
  }
}

/**
 * Cancela uma procuração eletrônica
 * @param procuracaoId ID da procuração
 * @param motivoCancelamento Motivo do cancelamento
 */
export async function cancelarProcuracao(
  procuracaoId: string,
  motivoCancelamento: string
): Promise<ProcuracaoResponse> {
  try {
    // Atualizar status para cancelada
    const { error } = await updateProcuracaoStatusInDb(procuracaoId, 'cancelada');
      
    if (error) {
      throw error;
    }
    
    // Adicionar log de cancelamento
    await adicionarLogProcuracao(
      procuracaoId,
      criarLogProcuracao(
        'CANCELAR',
        'Procuração cancelada',
        { motivo: motivoCancelamento }
      )
    );
    
    toast({
      title: "Procuração cancelada",
      description: "A procuração foi cancelada com sucesso",
    });
    
    return {
      success: true,
      message: "Procuração cancelada com sucesso"
    };
  } catch (error: any) {
    console.error('Erro ao cancelar procuração:', error);
    
    toast({
      title: "Erro ao cancelar procuração",
      description: error.message || "Não foi possível cancelar a procuração",
      variant: "destructive"
    });
    
    return {
      success: false,
      error: error.message || "Erro ao cancelar procuração"
    };
  }
}

/**
 * Anexa um comprovante à procuração eletrônica
 * @param procuracaoId ID da procuração
 * @param comprovante Arquivo de comprovante
 */
export async function anexarComprovanteProcuracao(
  procuracaoId: string,
  comprovante: File
): Promise<ProcuracaoResponse> {
  try {
    // Obter dados da procuração
    const { data, error } = await fetchProcuracaoPorIdFromDb(procuracaoId);
    
    if (error || !data) {
      throw new Error("Procuração não encontrada");
    }
    
    // Upload do arquivo
    const comprovanteUrl = await uploadProcuracaoDocument(
      data.client_id, 
      procuracaoId, 
      comprovante
    );
    
    if (!comprovanteUrl) {
      throw new Error("Não foi possível fazer upload do comprovante");
    }
    
    // Atualizar registro com URL do comprovante
    const { error: updateError } = await supabase
      .from('procuracoes_eletronicas')
      .update({ comprovante_url: comprovanteUrl })
      .eq('id', procuracaoId);
      
    if (updateError) {
      throw updateError;
    }
    
    // Adicionar log
    await adicionarLogProcuracao(
      procuracaoId,
      criarLogProcuracao(
        'ANEXAR_COMPROVANTE',
        'Comprovante anexado com sucesso',
        { arquivo: comprovante.name, tamanho: comprovante.size }
      )
    );
    
    toast({
      title: "Comprovante anexado",
      description: "O comprovante foi anexado à procuração com sucesso"
    });
    
    return {
      success: true,
      message: "Comprovante anexado com sucesso"
    };
  } catch (error: any) {
    console.error('Erro ao anexar comprovante:', error);
    
    toast({
      title: "Erro ao anexar comprovante",
      description: error.message || "Não foi possível anexar o comprovante à procuração",
      variant: "destructive"
    });
    
    return {
      success: false,
      error: error.message || "Erro ao anexar comprovante"
    };
  }
}
