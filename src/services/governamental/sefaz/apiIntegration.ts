
import { supabase } from "@/lib/supabase/client";
import { UF } from "../estadualIntegration";
import { ProcuracaoEletronica } from "../procuracaoService/types";
import { ScrapeResult } from "./types";
import { toast } from "@/hooks/use-toast";

// Configurações das APIs por estado
const SEFAZ_API_CONFIGS: Record<UF, {
  baseUrl: string;
  authEndpoint: string;
  consultaEndpoint: string;
  guiasEndpoint: string;
  certificateRequired: boolean;
  apiKeyRequired: boolean;
}> = {
  'SP': {
    baseUrl: 'https://www.fazenda.sp.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/debitos',
    guiasEndpoint: '/guias/emissao',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'RJ': {
    baseUrl: 'https://www.fazenda.rj.gov.br/api',
    authEndpoint: '/oauth/token',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/guias',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'MG': {
    baseUrl: 'https://www.fazenda.mg.gov.br/api',
    authEndpoint: '/autenticacao',
    consultaEndpoint: '/consultas/situacao-fiscal',
    guiasEndpoint: '/pagamentos/guias',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'SC': {
    baseUrl: 'https://servicos.fazenda.sc.gov.br/api',
    authEndpoint: '/serpro/integra/auth',
    consultaEndpoint: '/serpro/integra/consultas',
    guiasEndpoint: '/serpro/integra/guias',
    certificateRequired: true,
    apiKeyRequired: true
  },
  'RS': {
    baseUrl: 'https://www.sefaz.rs.gov.br/api',
    authEndpoint: '/auth/certificado',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/emissao',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'PR': {
    baseUrl: 'https://www.fazenda.pr.gov.br/api',
    authEndpoint: '/auth/digital',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/dar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  // Adicionar outros estados conforme necessário
  'ES': {
    baseUrl: 'https://internet.sefaz.es.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/nfe',
    guiasEndpoint: '/guias/dar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'BA': {
    baseUrl: 'https://www.sefaz.ba.gov.br/api',
    authEndpoint: '/oauth/certificado',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/gerar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'GO': {
    baseUrl: 'https://www.sefaz.go.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/debitos',
    guiasEndpoint: '/guias/icms',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'MS': {
    baseUrl: 'https://www.sefaz.ms.gov.br/api',
    authEndpoint: '/auth/digital',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/guias',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'MT': {
    baseUrl: 'https://www.sefaz.mt.gov.br/api',
    authEndpoint: '/oauth/token',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/emitir',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'DF': {
    baseUrl: 'https://www.fazenda.df.gov.br/api',
    authEndpoint: '/auth/certificado',
    consultaEndpoint: '/consultas/situacao',
    guiasEndpoint: '/guias/gerar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'TO': {
    baseUrl: 'https://www.sefaz.to.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/nfe',
    guiasEndpoint: '/dar/emissao',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'PA': {
    baseUrl: 'https://www.sefa.pa.gov.br/api',
    authEndpoint: '/oauth/certificado',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/gerar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'AM': {
    baseUrl: 'https://www.sefaz.am.gov.br/api',
    authEndpoint: '/auth/digital',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/dar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'RR': {
    baseUrl: 'https://www.sefaz.rr.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/debitos',
    guiasEndpoint: '/guias/emitir',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'AP': {
    baseUrl: 'https://www.sefaz.ap.gov.br/api',
    authEndpoint: '/oauth/token',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/emissao',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'RO': {
    baseUrl: 'https://www.sefin.ro.gov.br/api',
    authEndpoint: '/auth/certificado',
    consultaEndpoint: '/consultas/situacao',
    guiasEndpoint: '/guias/icms',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'AC': {
    baseUrl: 'https://www.sefaz.ac.gov.br/api',
    authEndpoint: '/auth/digital',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/guias',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'MA': {
    baseUrl: 'https://www.sefaz.ma.gov.br/api',
    authEndpoint: '/oauth/certificado',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/gerar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'PI': {
    baseUrl: 'https://www.sefaz.pi.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/nfe',
    guiasEndpoint: '/dar/emitir',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'CE': {
    baseUrl: 'https://www.sefaz.ce.gov.br/api',
    authEndpoint: '/auth/digital',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/dar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'RN': {
    baseUrl: 'https://www.set.rn.gov.br/api',
    authEndpoint: '/oauth/token',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/emissao',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'PB': {
    baseUrl: 'https://www.sefaz.pb.gov.br/api',
    authEndpoint: '/auth/certificado',
    consultaEndpoint: '/consultas/situacao',
    guiasEndpoint: '/guias/gerar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'PE': {
    baseUrl: 'https://www.sefaz.pe.gov.br/api',
    authEndpoint: '/auth/digital',
    consultaEndpoint: '/servicos/consultas',
    guiasEndpoint: '/servicos/guias',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'AL': {
    baseUrl: 'https://www.sefaz.al.gov.br/api',
    authEndpoint: '/oauth/certificado',
    consultaEndpoint: '/nfe/consultas',
    guiasEndpoint: '/dar/gerar',
    certificateRequired: true,
    apiKeyRequired: false
  },
  'SE': {
    baseUrl: 'https://www.sefaz.se.gov.br/api',
    authEndpoint: '/auth/token',
    consultaEndpoint: '/consultas/debitos',
    guiasEndpoint: '/guias/emitir',
    certificateRequired: true,
    apiKeyRequired: false
  }
};

/**
 * Autentica com a API da SEFAZ usando certificado digital e procuração
 */
export async function autenticarSefazApi(
  uf: UF,
  procuracao: ProcuracaoEletronica,
  certificadoData: any
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const config = SEFAZ_API_CONFIGS[uf];
    if (!config) {
      throw new Error(`Configuração não encontrada para SEFAZ-${uf}`);
    }

    // Preparar dados de autenticação
    const authData = {
      certificado: certificadoData.arquivo,
      senha_certificado: certificadoData.senha,
      procuracao_numero: procuracao.procuracao_numero,
      procurador_cpf: procuracao.procurador_cpf,
      tipo_autenticacao: 'certificado_digital_com_procuracao'
    };

    // Fazer requisição de autenticação
    const response = await fetch(`${config.baseUrl}${config.authEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-Contabil-Integrado/1.0'
      },
      body: JSON.stringify(authData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na autenticação: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      token: result.access_token || result.token
    };

  } catch (error: any) {
    console.error(`Erro na autenticação SEFAZ-${uf}:`, error);
    return {
      success: false,
      error: error.message || 'Falha na autenticação'
    };
  }
}

/**
 * Consulta débitos na SEFAZ usando procuração eletrônica
 */
export async function consultarDebitosSefazReal(
  uf: UF,
  procuracaoId: string,
  cnpj: string
): Promise<ScrapeResult> {
  try {
    // Buscar dados da procuração
    const { data: procuracao, error: procError } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('id', procuracaoId)
      .single();

    if (procError || !procuracao) {
      throw new Error('Procuração não encontrada');
    }

    // Buscar certificado digital
    const { data: certificado, error: certError } = await supabase
      .from('certificados_digitais')
      .select('*')
      .eq('id', procuracao.certificado_id)
      .single();

    if (certError || !certificado) {
      throw new Error('Certificado digital não encontrado');
    }

    // Autenticar com a API
    const authResult = await autenticarSefazApi(uf, procuracao, certificado);
    if (!authResult.success) {
      throw new Error(authResult.error || 'Falha na autenticação');
    }

    const config = SEFAZ_API_CONFIGS[uf];
    
    // Fazer consulta de débitos
    const consultaResponse = await fetch(`${config.baseUrl}${config.consultaEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}`,
        'User-Agent': 'Sistema-Contabil-Integrado/1.0'
      },
      body: JSON.stringify({
        cnpj: cnpj,
        tipo_consulta: 'debitos_pendentes',
        incluir_detalhes: true
      })
    });

    if (!consultaResponse.ok) {
      const errorText = await consultaResponse.text();
      throw new Error(`Erro na consulta: ${consultaResponse.status} - ${errorText}`);
    }

    const debitos = await consultaResponse.json();

    // Processar e salvar os dados
    const processedData = await processarDadosDebitos(uf, cnpj, debitos);
    
    return {
      success: true,
      data: processedData
    };

  } catch (error: any) {
    console.error(`Erro na consulta real SEFAZ-${uf}:`, error);
    
    toast({
      title: "Erro na consulta à SEFAZ",
      description: error.message || "Não foi possível consultar os débitos",
      variant: "destructive",
    });

    return {
      success: false,
      error: error.message || 'Falha na consulta à SEFAZ'
    };
  }
}

/**
 * Emite guia de pagamento na SEFAZ usando procuração eletrônica
 */
export async function emitirGuiaSefazReal(
  uf: UF,
  procuracaoId: string,
  dadosGuia: {
    cnpj: string;
    competencia: string;
    valor: number;
    tipo_tributo: string;
    codigo_receita?: string;
  }
): Promise<ScrapeResult> {
  try {
    // Buscar dados da procuração
    const { data: procuracao, error: procError } = await supabase
      .from('procuracoes_eletronicas')
      .select('*')
      .eq('id', procuracaoId)
      .single();

    if (procError || !procuracao) {
      throw new Error('Procuração não encontrada');
    }

    // Buscar certificado digital
    const { data: certificado, error: certError } = await supabase
      .from('certificados_digitais')
      .select('*')
      .eq('id', procuracao.certificado_id)
      .single();

    if (certError || !certificado) {
      throw new Error('Certificado digital não encontrado');
    }

    // Autenticar com a API
    const authResult = await autenticarSefazApi(uf, procuracao, certificado);
    if (!authResult.success) {
      throw new Error(authResult.error || 'Falha na autenticação');
    }

    const config = SEFAZ_API_CONFIGS[uf];
    
    // Emitir guia
    const guiaResponse = await fetch(`${config.baseUrl}${config.guiasEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}`,
        'User-Agent': 'Sistema-Contabil-Integrado/1.0'
      },
      body: JSON.stringify({
        ...dadosGuia,
        procuracao_numero: procuracao.procuracao_numero,
        procurador_cpf: procuracao.procurador_cpf
      })
    });

    if (!guiaResponse.ok) {
      const errorText = await guiaResponse.text();
      throw new Error(`Erro na emissão: ${guiaResponse.status} - ${errorText}`);
    }

    const guiaResult = await guiaResponse.json();

    return {
      success: true,
      data: {
        numeroGuia: guiaResult.numero_guia,
        codigoBarras: guiaResult.codigo_barras,
        linhaDigitavel: guiaResult.linha_digitavel,
        urlPdf: guiaResult.url_pdf,
        dataVencimento: guiaResult.data_vencimento,
        valor: guiaResult.valor
      }
    };

  } catch (error: any) {
    console.error(`Erro na emissão real SEFAZ-${uf}:`, error);
    
    toast({
      title: "Erro na emissão da guia",
      description: error.message || "Não foi possível emitir a guia",
      variant: "destructive",
    });

    return {
      success: false,
      error: error.message || 'Falha na emissão da guia'
    };
  }
}

/**
 * Processa e formata os dados de débitos retornados pela API
 */
async function processarDadosDebitos(uf: UF, cnpj: string, dadosApi: any) {
  const debitosProcessados = dadosApi.debitos?.map((debito: any) => ({
    competencia: debito.competencia || debito.periodo,
    numero_guia: debito.numero_documento || debito.codigo_debito,
    valor: debito.valor_total || debito.valor,
    data_vencimento: debito.data_vencimento || debito.vencimento,
    status: debito.situacao || 'Pendente',
    tipo_tributo: debito.tipo_tributo || debito.imposto,
    codigo_receita: debito.codigo_receita
  })) || [];

  // Salvar no banco de dados
  if (debitosProcessados.length > 0) {
    const { error } = await supabase
      .from('sefaz_sp_scrapes')
      .insert(debitosProcessados.map((debito: any) => ({
        client_id: cnpj, // Usar CNPJ como identificador temporário
        competencia: debito.competencia,
        numero_guia: debito.numero_guia,
        valor: debito.valor,
        data_vencimento: debito.data_vencimento,
        status: debito.status,
        uf: uf
      })));

    if (error) {
      console.error('Erro ao salvar débitos:', error);
    }
  }

  return {
    debitos: debitosProcessados,
    total_encontrado: debitosProcessados.length,
    data_consulta: new Date().toISOString(),
    uf: uf
  };
}
