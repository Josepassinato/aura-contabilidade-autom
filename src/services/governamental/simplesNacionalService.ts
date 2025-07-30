import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SimplesNacionalConfig {
  clientId: string;
  cnpj: string;
  certificadoId: string;
  codigoAcesso?: string;
  ambiente: 'producao' | 'homologacao';
}

export interface SimplesNacionalResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Configurar integração com API do Simples Nacional
 */
export async function configurarSimplesNacional(config: SimplesNacionalConfig): Promise<boolean> {
  try {
    // Verificar se certificado existe
    const { data: certificado, error: certError } = await supabase
      .from('certificados_digitais')
      .select('*')
      .eq('id', config.certificadoId)
      .eq('client_id', config.clientId)
      .single();

    if (certError || !certificado) {
      throw new Error('Certificado digital não encontrado');
    }

    // Salvar configuração
    const { error: configError } = await supabase
      .from('integracoes_externas')
      .upsert({
        client_id: config.clientId,
        tipo_integracao: 'simples_nacional',
        credenciais: {
          cnpj: config.cnpj,
          certificado_id: config.certificadoId,
          codigo_acesso: config.codigoAcesso,
          ambiente: config.ambiente,
          configurado_em: new Date().toISOString()
        },
        status: 'configurado'
      });

    if (configError) throw configError;

    toast({
      title: "Simples Nacional configurado",
      description: "Integração com Simples Nacional configurada com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao configurar Simples Nacional:', error);
    
    toast({
      title: "Erro na configuração",
      description: error.message || "Falha ao configurar Simples Nacional",
      variant: "destructive"
    });
    
    return false;
  }
}

/**
 * Consultar situação no Simples Nacional
 */
export async function consultarSituacaoSimples(cnpj: string, clientId: string): Promise<SimplesNacionalResponse> {
  try {
    const { data: config, error: configError } = await supabase
      .from('integracoes_externas')
      .select('*')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'simples_nacional')
      .eq('status', 'configurado')
      .single();

    if (configError || !config) {
      throw new Error('Integração com Simples Nacional não configurada');
    }

    const { data, error } = await supabase.functions.invoke('consulta-simples-nacional', {
      body: {
        cnpj,
        clientId,
        operacao: 'situacao'
      }
    });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Erro ao consultar Simples Nacional:', error);
    return {
      success: false,
      error: error.message || "Falha na consulta ao Simples Nacional"
    };
  }
}

/**
 * Calcular impostos do Simples Nacional
 */
export async function calcularImpostosSimples(cnpj: string, receita: number, clientId: string): Promise<SimplesNacionalResponse> {
  try {
    const { data: config, error: configError } = await supabase
      .from('integracoes_externas')
      .select('*')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'simples_nacional')
      .eq('status', 'configurado')
      .single();

    if (configError || !config) {
      throw new Error('Integração com Simples Nacional não configurada');
    }

    const { data, error } = await supabase.functions.invoke('calculo-simples-nacional', {
      body: {
        cnpj,
        receita,
        clientId,
        operacao: 'calcular_impostos'
      }
    });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Erro ao calcular impostos:', error);
    return {
      success: false,
      error: error.message || "Falha no cálculo de impostos"
    };
  }
}

/**
 * Enviar declaração do Simples Nacional
 */
export async function enviarDeclaracaoSimples(dadosDeclaracao: any, clientId: string): Promise<SimplesNacionalResponse> {
  try {
    const { data: config, error: configError } = await supabase
      .from('integracoes_externas')
      .select('*')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'simples_nacional')
      .eq('status', 'configurado')
      .single();

    if (configError || !config) {
      throw new Error('Integração com Simples Nacional não configurada');
    }

    const { data, error } = await supabase.functions.invoke('envio-declaracao-simples', {
      body: {
        dadosDeclaracao,
        clientId,
        operacao: 'enviar_declaracao'
      }
    });

    if (error) throw error;

    // Salvar registro da declaração enviada
    await supabase
      .from('declaracoes_simples_nacional')
      .insert({
        client_id: clientId,
        ano: dadosDeclaracao.ano,
        mes: dadosDeclaracao.mes,
        receita_bruta: dadosDeclaracao.receita,
        impostos: data.impostos,
        cnpj: config.credenciais.cnpj,
        situacao: 'enviada'
      });

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Erro ao enviar declaração:', error);
    return {
      success: false,
      error: error.message || "Falha no envio da declaração"
    };
  }
}