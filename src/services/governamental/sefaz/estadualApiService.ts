
import { UF } from "../estadualIntegration";
import { ScrapeResult } from "./types";
import { consultarDebitosSefazReal, emitirGuiaSefazReal } from "./apiIntegration";
import { buscarProcuracaoValidaAutomatica } from "../sefazAutomaticService";
import { supabase } from "@/lib/supabase/client";

/**
 * Serviço específico para integração com Santa Catarina (Serpro Integra Contador)
 */
export async function consultarSefazSC(clientId: string): Promise<ScrapeResult> {
  try {
    // Buscar procuração válida para SC
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, 'SC');
    if (!procuracaoId) {
      throw new Error('Procuração eletrônica não encontrada para SEFAZ-SC');
    }

    // Buscar CNPJ do cliente
    const { data: client, error } = await supabase
      .from('accounting_clients')
      .select('cnpj')
      .eq('id', clientId)
      .single();

    if (error || !client) {
      throw new Error('Cliente não encontrado');
    }

    // Usar integração específica do Serpro para SC
    return await integracaoSerproSC(procuracaoId, client.cnpj);

  } catch (error: any) {
    console.error('Erro na consulta SEFAZ-SC:', error);
    return {
      success: false,
      error: error.message || 'Falha na consulta à SEFAZ-SC'
    };
  }
}

/**
 * Integração específica com o Serpro Integra Contador para Santa Catarina
 */
async function integracaoSerproSC(procuracaoId: string, cnpj: string): Promise<ScrapeResult> {
  try {
    // Buscar credenciais do Serpro
    const { data: serpro, error } = await supabase
      .from('serpro_api_credentials')
      .select('*')
      .limit(1)
      .single();

    if (error || !serpro) {
      throw new Error('Credenciais do Serpro não configuradas');
    }

    // URL base do Serpro Integra Contador (ambiente de produção)
    const baseUrl = serpro.ambiente === 'production' 
      ? 'https://gateway.apiserpro.serpro.gov.br/integra-contador-pf/api'
      : 'https://gateway.apiserpro.serpro.gov.br/integra-contador-pf-trial/api';

    // Obter token de acesso
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${serpro.client_id}:${serpro.client_secret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Falha na autenticação com Serpro');
    }

    const tokenData = await tokenResponse.json();

    // Consultar débitos estaduais via Serpro
    const consultaResponse = await fetch(`${baseUrl}/sefaz/sc/debitos/${cnpj}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!consultaResponse.ok) {
      throw new Error(`Erro na consulta via Serpro: ${consultaResponse.status}`);
    }

    const debitosData = await consultaResponse.json();

    // Processar dados retornados
    const debitosProcessados = debitosData.debitos?.map((debito: any) => ({
      competencia: debito.competencia,
      numero_guia: debito.numeroDocumento,
      valor: `R$ ${debito.valor.toFixed(2).replace('.', ',')}`,
      data_vencimento: debito.dataVencimento,
      status: debito.situacao || 'Pendente',
      codigo_receita: debito.codigoReceita
    })) || [];

    return {
      success: true,
      data: {
        debitos: debitosProcessados,
        fonte: 'Serpro Integra Contador',
        uf: 'SC',
        data_consulta: new Date().toISOString()
      }
    };

  } catch (error: any) {
    console.error('Erro na integração Serpro SC:', error);
    return {
      success: false,
      error: error.message || 'Falha na integração com Serpro'
    };
  }
}

/**
 * Serviço genérico para outros estados que usam APIs padrão
 */
export async function consultarSefazGenerico(
  clientId: string,
  uf: UF
): Promise<ScrapeResult> {
  try {
    // Buscar procuração válida para o estado
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    if (!procuracaoId) {
      throw new Error(`Procuração eletrônica não encontrada para SEFAZ-${uf}`);
    }

    // Buscar CNPJ do cliente
    const { data: client, error } = await supabase
      .from('accounting_clients')
      .select('cnpj')
      .eq('id', clientId)
      .single();

    if (error || !client) {
      throw new Error('Cliente não encontrado');
    }

    // Usar integração genérica
    return await consultarDebitosSefazReal(uf, procuracaoId, client.cnpj);

  } catch (error: any) {
    console.error(`Erro na consulta SEFAZ-${uf}:`, error);
    return {
      success: false,
      error: error.message || `Falha na consulta à SEFAZ-${uf}`
    };
  }
}

/**
 * Roteador principal para consultas SEFAZ por estado
 */
export async function consultarSefazPorEstado(
  clientId: string,
  uf: UF
): Promise<ScrapeResult> {
  console.log(`Iniciando consulta real à SEFAZ-${uf} para cliente ${clientId}`);

  try {
    // Verificar se o cliente tem procuração válida
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    if (!procuracaoId) {
      return {
        success: false,
        error: `Cliente não possui procuração eletrônica válida para SEFAZ-${uf}. Configure uma procuração antes de consultar.`
      };
    }

    // Roteamento por estado
    switch (uf) {
      case 'SC':
        return await consultarSefazSC(clientId);
      
      case 'SP':
      case 'RJ':
      case 'MG':
      case 'RS':
      case 'PR':
      case 'ES':
      case 'BA':
      case 'GO':
      case 'MS':
      case 'MT':
      case 'DF':
      case 'TO':
      case 'PA':
      case 'AM':
      case 'RR':
      case 'AP':
      case 'RO':
      case 'AC':
      case 'MA':
      case 'PI':
      case 'CE':
      case 'RN':
      case 'PB':
      case 'PE':
      case 'AL':
      case 'SE':
        return await consultarSefazGenerico(clientId, uf);

      default:
        return {
          success: false,
          error: `Integração com SEFAZ-${uf} ainda não implementada`
        };
    }

  } catch (error: any) {
    console.error(`Erro geral na consulta SEFAZ-${uf}:`, error);
    return {
      success: false,
      error: error.message || `Erro na consulta à SEFAZ-${uf}`
    };
  }
}

/**
 * Emissão de guias por estado
 */
export async function emitirGuiaPorEstado(
  clientId: string,
  uf: UF,
  dadosGuia: {
    competencia: string;
    valor: number;
    tipo_tributo: string;
    codigo_receita?: string;
  }
): Promise<ScrapeResult> {
  try {
    // Buscar procuração válida
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    if (!procuracaoId) {
      throw new Error(`Procuração eletrônica não encontrada para SEFAZ-${uf}`);
    }

    // Buscar CNPJ do cliente
    const { data: client, error } = await supabase
      .from('accounting_clients')
      .select('cnpj')
      .eq('id', clientId)
      .single();

    if (error || !client) {
      throw new Error('Cliente não encontrado');
    }

    // Emitir guia
    return await emitirGuiaSefazReal(uf, procuracaoId, {
      ...dadosGuia,
      cnpj: client.cnpj
    });

  } catch (error: any) {
    console.error(`Erro na emissão de guia SEFAZ-${uf}:`, error);
    return {
      success: false,
      error: error.message || `Falha na emissão da guia SEFAZ-${uf}`
    };
  }
}
