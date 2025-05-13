
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para dados da integração com Simples Nacional no banco
 */
interface IntegracaoSimplesNacionalDB {
  id: string;
  client_id: string;
  cnpj: string;
  codigo_acesso: string | null;
  certificado_digital: string | null;
  status: string;
  ultimo_acesso: string | null;
  proxima_renovacao: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Busca a integração com Simples Nacional de um cliente
 */
export async function fetchIntegracaoSimplesNacional(clientId: string): Promise<any | null> {
  try {
    if (!clientId) {
      throw new Error("ID do cliente não informado");
    }

    const { data, error } = await supabase
      .from('integracoes_simples_nacional')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar integração do Simples Nacional:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar integração do Simples Nacional:', error);
    return null;
  }
}

/**
 * Salva ou atualiza uma integração com Simples Nacional
 */
export async function saveIntegracaoSimplesNacional(
  clientId: string,
  cnpj: string,
  data: any
): Promise<boolean> {
  try {
    // Verificar se já existe uma integração para este cliente
    const { data: existingData, error: queryError } = await supabase
      .from('integracoes_simples_nacional')
      .select('id')
      .eq('client_id', clientId)
      .maybeSingle();

    if (queryError) {
      throw queryError;
    }

    const integracaoData = {
      client_id: clientId,
      cnpj: cnpj,
      codigo_acesso: data.codigoAcesso || null,
      certificado_digital: data.certificadoDigital || null,
      status: 'conectado',
      ultimo_acesso: new Date().toISOString(),
      proxima_renovacao: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    };

    let result;

    if (existingData?.id) {
      // Atualizar registro existente
      result = await supabase
        .from('integracoes_simples_nacional')
        .update(integracaoData)
        .eq('id', existingData.id);
    } else {
      // Inserir novo registro
      result = await supabase
        .from('integracoes_simples_nacional')
        .insert([integracaoData]);
    }

    if (result.error) {
      throw result.error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar integração do Simples Nacional:', error);
    return false;
  }
}
