
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface para token de acesso do cliente
 */
export interface ClientAccessToken extends Tables<"client_access_tokens"> {
  client?: {
    name: string;
    cnpj: string;
  };
}

/**
 * Busca todos os tokens de acesso
 */
export async function fetchAllTokens(): Promise<ClientAccessToken[]> {
  try {
    const { data, error } = await supabase
      .from('client_access_tokens')
      .select(`
        *,
        client:client_id (
          name,
          cnpj
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar tokens:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar tokens:', error);
    return [];
  }
}

/**
 * Busca tokens de acesso para um cliente específico
 */
export async function fetchTokensByClient(clientId: string): Promise<ClientAccessToken[]> {
  if (!clientId) return [];
  
  try {
    const { data, error } = await supabase
      .from('client_access_tokens')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar tokens para cliente ${clientId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar tokens para cliente ${clientId}:`, error);
    return [];
  }
}

/**
 * Gera um novo token para um cliente
 */
export async function generateToken(clientId: string, description?: string, expiresAt?: Date): Promise<string | null> {
  try {
    // Gerar token aleatório
    const token = Array.from({ length: 6 }, () => {
      return Math.floor(Math.random() * 10);
    }).join('');
    
    // Inserir na tabela
    const { data, error } = await supabase
      .from('client_access_tokens')
      .insert([{ 
        client_id: clientId,
        token,
        description,
        expires_at: expiresAt ? expiresAt.toISOString() : null
      }])
      .select('token')
      .single();
      
    if (error) {
      console.error(`Erro ao gerar token para cliente ${clientId}:`, error);
      throw error;
    }
    
    return data?.token || null;
  } catch (error) {
    console.error(`Erro ao gerar token para cliente ${clientId}:`, error);
    return null;
  }
}

/**
 * Desativa um token existente
 */
export async function deactivateToken(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_access_tokens')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao desativar token ${id}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao desativar token ${id}:`, error);
    return false;
  }
}

/**
 * Exclui permanentemente um token
 */
export async function deleteToken(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_access_tokens')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao excluir token ${id}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao excluir token ${id}:`, error);
    return false;
  }
}
