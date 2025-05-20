
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UF } from "../estadualIntegration";
import { ProcuracaoEletronica } from "../procuracaoService/types";
import { ScrapeResult } from "./types";

/**
 * Verifica se a procuração eletrônica está válida para uso na SEFAZ
 * @param procuracaoId ID da procuração eletrônica
 * @param uf UF da SEFAZ a ser consultada
 */
export async function verificarProcuracaoParaSefaz(
  procuracaoId: string,
  uf: UF
): Promise<ScrapeResult> {
  try {
    // Buscar dados da procuração
    const { data: procuracao, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('id', procuracaoId)
      .single();
      
    if (error) {
      throw new Error(`Erro ao buscar procuração: ${error.message}`);
    }
    
    if (!procuracao) {
      throw new Error("Procuração não encontrada");
    }
    
    // Verificar se a procuração está ativa
    if (procuracao.status !== 'emitida') {
      throw new Error(`A procuração não está ativa. Status atual: ${procuracao.status}`);
    }
    
    // Verificar data de validade
    const dataValidade = new Date(procuracao.data_validade);
    if (dataValidade < new Date()) {
      throw new Error(`A procuração expirou em ${dataValidade.toLocaleDateString()}`);
    }
    
    // Verificar se os serviços autorizados contêm permissões necessárias para SEFAZ
    const servicosNecessarios = obterServicosNecessariosParaSefaz(uf);
    const temPermissao = servicosNecessarios.every(servico => 
      procuracao.servicos_autorizados.includes(servico)
    );
    
    if (!temPermissao) {
      throw new Error(`A procuração não possui todas as permissões necessárias para acessar a SEFAZ-${uf}`);
    }
    
    // Registrar o uso da procuração
    await registrarUsoProcuracao(procuracaoId, `Verificação para acesso à SEFAZ-${uf}`);
    
    return {
      success: true,
      data: {
        procuracao: procuracao,
        message: `Procuração válida para acesso à SEFAZ-${uf}`
      }
    };
    
  } catch (error: any) {
    console.error("Erro ao verificar procuração para SEFAZ:", error);
    
    toast({
      title: "Erro na validação da procuração",
      description: error.message || "Não foi possível validar a procuração para uso na SEFAZ",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: error.message || "Falha ao validar procuração"
    };
  }
}

/**
 * Utiliza a procuração para consultar dados na SEFAZ
 * @param procuracaoId ID da procuração eletrônica
 * @param uf UF da SEFAZ a ser consultada
 * @param operacao Tipo de operação a ser realizada
 */
export async function consultarSefazComProcuracao(
  procuracaoId: string,
  uf: UF,
  operacao: string
): Promise<ScrapeResult> {
  try {
    // Primeiro verificamos se a procuração é válida
    const verificacao = await verificarProcuracaoParaSefaz(procuracaoId, uf);
    if (!verificacao.success) {
      throw new Error(verificacao.error || "Procuração inválida para acesso à SEFAZ");
    }
    
    // Obter dados da procuração
    const procuracao = verificacao.data.procuracao as ProcuracaoEletronica;
    
    // Registrar o uso da procuração para esta operação específica
    await registrarUsoProcuracao(procuracaoId, `Consulta à SEFAZ-${uf}: ${operacao}`);
    
    // Aqui implementamos a lógica para acessar a API da SEFAZ usando a procuração
    // Em uma implementação real, aqui seria feita a chamada para a API da SEFAZ
    // usando o certificado digital associado à procuração e os dados de autenticação
    
    console.log(`Simulando consulta à SEFAZ-${uf} com a procuração ${procuracao.procuracao_numero}`);
    
    // Para fins de demonstração, simulamos uma resposta bem-sucedida
    return {
      success: true,
      data: {
        operacao: operacao,
        procuracaoNumero: procuracao.procuracao_numero,
        dataConsulta: new Date().toISOString(),
        resultado: `Consulta à SEFAZ-${uf} realizada com sucesso usando a procuração ${procuracao.procuracao_numero}`
      }
    };
    
  } catch (error: any) {
    console.error("Erro ao consultar SEFAZ com procuração:", error);
    
    toast({
      title: "Erro na consulta à SEFAZ",
      description: error.message || "Não foi possível realizar a consulta à SEFAZ",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: error.message || "Falha ao consultar SEFAZ com procuração"
    };
  }
}

/**
 * Registra o uso da procuração no log de processamento
 * @param procuracaoId ID da procuração eletrônica
 * @param descricao Descrição da operação realizada
 */
async function registrarUsoProcuracao(
  procuracaoId: string,
  descricao: string
): Promise<void> {
  try {
    // Primeiro, buscar o log atual
    const { data: procuracao, error } = await supabase
      .from('procuracoes_eletronicas')
      .select('log_processamento')
      .eq('id', procuracaoId)
      .single();
      
    if (error) {
      console.error("Erro ao buscar log da procuração:", error);
      return;
    }
    
    // Criar novo registro de log
    const novoLog = {
      timestamp: new Date().toISOString(),
      acao: 'USO_API_SEFAZ',
      resultado: descricao
    };
    
    // Adicionar ao array de logs existente ou criar novo array
    const logAtualizado = procuracao.log_processamento 
      ? [...procuracao.log_processamento, JSON.stringify(novoLog)] 
      : [JSON.stringify(novoLog)];
    
    // Atualizar o registro da procuração com o novo log
    await supabase
      .from('procuracoes_eletronicas')
      .update({ log_processamento: logAtualizado })
      .eq('id', procuracaoId);
      
  } catch (error) {
    console.error("Erro ao registrar uso da procuração:", error);
  }
}

/**
 * Obter lista de serviços necessários para acesso à SEFAZ por UF
 * @param uf UF da SEFAZ 
 */
function obterServicosNecessariosParaSefaz(uf: UF): string[] {
  // Diferentes estados podem requerer diferentes permissões
  const servicosPorUF: Record<UF, string[]> = {
    'SP': ['CONSULTAR_DEBITOS', 'EMITIR_GUIAS', 'CONSULTAR_NFE'],
    'RJ': ['CONSULTAR_DEBITOS', 'EMITIR_GUIAS', 'CONSULTAR_NFE'],
    'MG': ['CONSULTAR_DEBITOS', 'EMITIR_GUIAS', 'CONSULTAR_NFE', 'CONTESTAR_AUTOS'],
    'RS': ['CONSULTAR_DEBITOS', 'EMITIR_GUIAS', 'CONSULTAR_NFE'],
    'SC': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'PR': ['CONSULTAR_DEBITOS', 'EMITIR_GUIAS', 'CONSULTAR_NFE'],
    'ES': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'BA': ['CONSULTAR_DEBITOS', 'EMITIR_GUIAS', 'CONSULTAR_NFE'],
    // Adicionar os demais estados conforme necessário
    'GO': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'MS': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'MT': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'DF': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'TO': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'PA': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'AM': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'RR': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'AP': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'RO': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'AC': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'MA': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'PI': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'CE': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'RN': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'PB': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'PE': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'AL': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'],
    'SE': ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE']
  };
  
  return servicosPorUF[uf] || ['CONSULTAR_DEBITOS', 'CONSULTAR_NFE'];
}

/**
 * Emite guias de pagamento usando a procuração eletrônica
 * @param procuracaoId ID da procuração eletrônica
 * @param uf UF da SEFAZ
 * @param dadosGuia Dados para emissão da guia
 */
export async function emitirGuiaSefazComProcuracao(
  procuracaoId: string,
  uf: UF,
  dadosGuia: Record<string, any>
): Promise<ScrapeResult> {
  try {
    // Verificar se procuração é válida para emissão de guias
    const verificacao = await verificarProcuracaoParaSefaz(procuracaoId, uf);
    if (!verificacao.success) {
      throw new Error(verificacao.error || "Procuração inválida para emissão de guias");
    }
    
    // Obter dados da procuração
    const procuracao = verificacao.data.procuracao as ProcuracaoEletronica;
    
    // Verificar se a procuração permite emissão de guias
    if (!procuracao.servicos_autorizados.includes('EMITIR_GUIAS')) {
      throw new Error("A procuração não autoriza a emissão de guias de pagamento");
    }
    
    // Registrar o uso da procuração para esta operação específica
    await registrarUsoProcuracao(
      procuracaoId, 
      `Emissão de guia na SEFAZ-${uf} - ${dadosGuia.competencia || 'Sem competência'}`
    );
    
    // Simulando emissão de guia (numa implementação real, aqui seria feita a chamada à API da SEFAZ)
    console.log(`Simulando emissão de guia na SEFAZ-${uf} usando procuração ${procuracao.procuracao_numero}`);
    
    // Para fins de demonstração, simulamos uma resposta bem-sucedida
    return {
      success: true,
      data: {
        procuracaoNumero: procuracao.procuracao_numero,
        numeroGuia: `GUIA-${Math.floor(Math.random() * 10000000)}`,
        competencia: dadosGuia.competencia || 'Não informada',
        valor: dadosGuia.valor || 'Não informado',
        dataVencimento: dadosGuia.dataVencimento || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        urlPDF: `https://exemplo.sefaz.gov.br/guias/${uf.toLowerCase()}/${Math.floor(Math.random() * 10000000)}.pdf`
      }
    };
    
  } catch (error: any) {
    console.error("Erro ao emitir guia com procuração:", error);
    
    toast({
      title: "Erro na emissão da guia",
      description: error.message || "Não foi possível emitir a guia de pagamento",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: error.message || "Falha ao emitir guia com procuração"
    };
  }
}
