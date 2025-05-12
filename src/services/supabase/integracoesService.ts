
import { supabase } from "@/integrations/supabase/client";
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";

/**
 * Interface para dados da integração estadual no banco
 */
interface IntegracaoEstadualDB {
  id: string;
  client_id: string;
  uf: string;
  nome: string;
  status: string;
  ultimo_acesso: string | null;
  proxima_renovacao: string | null;
  mensagem_erro: string | null;
  certificado_info: any;
  created_at: string;
  updated_at: string;
}

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
 * Busca todas as integrações estaduais de um cliente
 */
export async function fetchIntegracoesEstaduais(clientId: string): Promise<IntegracaoEstadualStatus[]> {
  try {
    if (!clientId) {
      throw new Error("ID do cliente não informado");
    }

    const { data, error } = await supabase
      .from('integracoes_estaduais')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('Erro ao buscar integrações estaduais:', error);
      throw error;
    }

    // Se não tiver dados, retorna array vazio
    if (!data || data.length === 0) {
      return [];
    }

    // Mapear os dados para o formato esperado pelo componente
    return data.map((item: IntegracaoEstadualDB) => ({
      id: item.id,
      nome: item.nome,
      uf: item.uf as UF,
      status: item.status as 'conectado' | 'desconectado' | 'erro' | 'pendente',
      ultimoAcesso: item.ultimo_acesso ? new Date(item.ultimo_acesso).toLocaleString('pt-BR') : undefined,
      proximaRenovacao: item.proxima_renovacao ? new Date(item.proxima_renovacao).toLocaleString('pt-BR') : undefined,
      mensagem: item.mensagem_erro || undefined
    }));

  } catch (error) {
    console.error('Erro ao buscar integrações estaduais:', error);
    return [];
  }
}

/**
 * Salva ou atualiza uma integração estadual
 */
export async function saveIntegracaoEstadual(
  clientId: string,
  uf: UF, 
  data: any
): Promise<boolean> {
  try {
    // Verificar se já existe uma integração para este cliente/UF
    const { data: existingData, error: queryError } = await supabase
      .from('integracoes_estaduais')
      .select('id')
      .eq('client_id', clientId)
      .eq('uf', uf)
      .maybeSingle();

    if (queryError) {
      throw queryError;
    }

    const integracaoData = {
      client_id: clientId,
      uf: uf,
      nome: `SEFAZ-${uf}`,
      status: 'conectado',
      ultimo_acesso: new Date().toISOString(),
      proxima_renovacao: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      certificado_info: JSON.stringify({
        nome: data.certificadoDigital || '',
        usuario: data.usuario || '',
        codigo_acesso: data.codigoAcesso || ''
      })
    };

    let result;

    if (existingData?.id) {
      // Atualizar registro existente
      result = await supabase
        .from('integracoes_estaduais')
        .update(integracaoData)
        .eq('id', existingData.id);
    } else {
      // Inserir novo registro
      result = await supabase
        .from('integracoes_estaduais')
        .insert([integracaoData]);
    }

    if (result.error) {
      throw result.error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar integração estadual:', error);
    return false;
  }
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
