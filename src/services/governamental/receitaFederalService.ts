import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ReceitaFederalConfig {
  clientId: string;
  certificadoId: string;
  ambiente: 'producao' | 'homologacao';
  servicos: string[];
}

export interface ReceitaFederalResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Configurar integração com API oficial da Receita Federal
 */
export async function configurarReceitaFederal(config: ReceitaFederalConfig): Promise<boolean> {
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

    // Salvar configuração na tabela integracoes_externas
    const { error: configError } = await supabase
      .from('integracoes_externas')
      .upsert({
        client_id: config.clientId,
        tipo_integracao: 'receita_federal',
        credenciais: {
          certificado_id: config.certificadoId,
          ambiente: config.ambiente,
          servicos_habilitados: config.servicos,
          configurado_em: new Date().toISOString()
        },
        status: 'configurado'
      });

    if (configError) throw configError;

    toast({
      title: "Receita Federal configurada",
      description: "Integração com API da Receita Federal configurada com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao configurar Receita Federal:', error);
    
    toast({
      title: "Erro na configuração",
      description: error.message || "Falha ao configurar Receita Federal",
      variant: "destructive"
    });
    
    return false;
  }
}

/**
 * Consultar situação fiscal na Receita Federal
 */
export async function consultarSituacaoFiscal(cnpj: string, clientId: string): Promise<ReceitaFederalResponse> {
  try {
    // Verificar se integração está configurada
    const { data: config, error: configError } = await supabase
      .from('integracoes_externas')
      .select('*')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'receita_federal')
      .eq('status', 'configurado')
      .single();

    if (configError || !config) {
      throw new Error('Integração com Receita Federal não configurada');
    }

    // Chamar edge function para consulta segura
    const { data, error } = await supabase.functions.invoke('consulta-receita-federal', {
      body: {
        cnpj,
        clientId,
        operacao: 'situacao_fiscal'
      }
    });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Erro ao consultar Receita Federal:', error);
    return {
      success: false,
      error: error.message || "Falha na consulta à Receita Federal"
    };
  }
}

/**
 * Consultar débitos na Receita Federal
 */
export async function consultarDebitosReceita(cnpj: string, clientId: string): Promise<ReceitaFederalResponse> {
  try {
    const { data: config, error: configError } = await supabase
      .from('integracoes_externas')
      .select('*')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'receita_federal')
      .eq('status', 'configurado')
      .single();

    if (configError || !config) {
      throw new Error('Integração com Receita Federal não configurada');
    }

    const { data, error } = await supabase.functions.invoke('consulta-receita-federal', {
      body: {
        cnpj,
        clientId,
        operacao: 'debitos'
      }
    });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Erro ao consultar débitos:', error);
    return {
      success: false,
      error: error.message || "Falha na consulta de débitos"
    };
  }
}