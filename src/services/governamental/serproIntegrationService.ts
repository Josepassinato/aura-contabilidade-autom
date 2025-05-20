
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SerproCredentials {
  client_id: string;
  client_secret: string;
  ambiente: 'sandbox' | 'producao';
}

interface SerproCredentialsResponse {
  success: boolean;
  credentials?: SerproCredentials;
  error?: string;
}

/**
 * Busca as credenciais do Serpro armazenadas no Supabase
 */
export async function fetchSerproCredentials(): Promise<SerproCredentialsResponse> {
  try {
    const { data, error } = await supabase
      .from('serpro_api_credentials')
      .select('client_id, client_secret, ambiente')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar credenciais do Serpro:', error);
      throw error;
    }

    return { 
      success: true, 
      credentials: data as SerproCredentials 
    };
  } catch (error: any) {
    console.error('Erro ao buscar credenciais do Serpro:', error);
    return { 
      success: false, 
      error: error.message || 'Não foi possível obter as credenciais do Serpro' 
    };
  }
}

/**
 * Salva ou atualiza as credenciais do Serpro no Supabase
 */
export async function saveSerproCredentials(
  credentials: SerproCredentials
): Promise<boolean> {
  try {
    // Verificar se já existem credenciais
    const { data: existingCredentials } = await supabase
      .from('serpro_api_credentials')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;

    if (existingCredentials?.id) {
      // Atualizar registro existente
      result = await supabase
        .from('serpro_api_credentials')
        .update(credentials)
        .eq('id', existingCredentials.id);
    } else {
      // Inserir novo registro
      result = await supabase
        .from('serpro_api_credentials')
        .insert([credentials]);
    }

    if (result.error) {
      throw result.error;
    }

    toast({
      title: "Credenciais salvas",
      description: "As credenciais do Serpro foram salvas com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao salvar credenciais do Serpro:', error);
    
    toast({
      title: "Erro ao salvar credenciais",
      description: error.message || "Não foi possível salvar as credenciais do Serpro",
      variant: "destructive"
    });
    
    return false;
  }
}
