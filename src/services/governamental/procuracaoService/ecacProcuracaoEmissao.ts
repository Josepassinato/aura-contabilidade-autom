
import { CertificadoDigital } from "../certificadosDigitaisService";
import { autenticarEcacReal } from "../ecacIntegration";
import { adicionarLogProcuracao } from "./procuracaoLogger";
import { atualizarStatusProcuracao } from "./procuracaoService";
import { LogProcuracao, ProcuracaoEletronica } from "./types";
import { supabase } from "@/lib/supabase/client";

/**
 * Implementação real do processo de emissão de procuração no e-CAC
 */
export async function processarEmissaoProcuracao(
  procuracao: ProcuracaoEletronica, 
  certificado: CertificadoDigital
): Promise<{
  success: boolean;
  message?: string;
  comprovante_url?: string;
}> {
  try {
    // Log de início
    await adicionarLogProcuracao(procuracao.id!, {
      timestamp: new Date().toISOString(),
      acao: 'INICIAR_PROCESSO_EMISSAO',
      resultado: 'Iniciando processo de emissão',
    } as LogProcuracao);

    // Atualizar status
    await atualizarStatusProcuracao(procuracao.id!, 'pendente', 'Iniciando autenticação');

    // 1. Autenticar no e-CAC com o certificado digital
    const autenticacaoResult = await autenticarEcacReal({
      certificado: {
        arquivo: certificado.arquivo,
        senha: certificado.senha
      },
      dados: {
        cnpj: procuracao.client_id
      }
    });

    if (!autenticacaoResult.success) {
      throw new Error(`Falha na autenticação: ${autenticacaoResult.error}`);
    }

    // Log de autenticação realizada
    await adicionarLogProcuracao(procuracao.id!, {
      timestamp: new Date().toISOString(),
      acao: 'AUTENTICACAO',
      resultado: 'Autenticação bem-sucedida no e-CAC',
      detalhes: { 
        sessao_expira: autenticacaoResult.expiresAt
      }
    } as LogProcuracao);

    // Implementação real para acesso ao e-CAC e emissão da procuração
    // 2. Acessar página de procurações
    await adicionarLogProcuracao(procuracao.id!, {
      timestamp: new Date().toISOString(),
      acao: 'NAVEGACAO',
      resultado: 'Acessando página de procurações no e-CAC',
    } as LogProcuracao);
    
    // 3. Criar nova procuração
    // Para cada etapa do processo real, adicionamos logs correspondentes
    const { realizarProcessoEmissao } = await import('./ecacProcuracaoProcesso');
    await realizarProcessoEmissao(procuracao, autenticacaoResult.sessionToken!);
    
    // 4. Obter URL do comprovante gerado
    const { obterComprovanteEcac } = await import('./ecacProcuracaoComprovante');
    const comprovanteUrl = await obterComprovanteEcac(procuracao.id!, procuracao.client_id);
    
    if (!comprovanteUrl) {
      throw new Error("Não foi possível obter o comprovante da procuração");
    }
    
    // Atualizar procuração com URL do comprovante
    const { error: updateError } = await supabase
      .from('procuracoes_eletronicas')
      .update({ comprovante_url: comprovanteUrl })
      .eq('id', procuracao.id);
      
    if (updateError) {
      console.error("Erro ao atualizar URL do comprovante:", updateError);
      // Não falhar completamente se apenas esta parte falhar
    }

    // Atualizar status para emitida
    await atualizarStatusProcuracao(procuracao.id!, 'emitida', 'Procuração emitida com sucesso');

    // Log de finalização
    await adicionarLogProcuracao(procuracao.id!, {
      timestamp: new Date().toISOString(),
      acao: 'FINALIZAR',
      resultado: 'Procuração emitida com sucesso',
      detalhes: {
        validade: procuracao.data_validade,
        comprovante: comprovanteUrl
      }
    } as LogProcuracao);

    return {
      success: true,
      message: "Procuração emitida e registrada com sucesso",
      comprovante_url: comprovanteUrl
    };
  } catch (error: any) {
    console.error('Erro ao processar emissão de procuração:', error);

    // Registrar erro no log
    await adicionarLogProcuracao(procuracao.id!, {
      timestamp: new Date().toISOString(),
      acao: 'ERRO',
      resultado: `Falha na emissão: ${error.message}`,
      detalhes: {
        erro: error.message,
        stack: error.stack
      }
    } as LogProcuracao);

    // Atualizar status para erro
    await atualizarStatusProcuracao(procuracao.id!, 'erro', `Erro: ${error.message}`);

    return {
      success: false,
      message: `Erro ao emitir procuração: ${error.message}`
    };
  }
}
