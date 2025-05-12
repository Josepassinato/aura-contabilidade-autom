
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AccountingClient } from "@/lib/supabase";

/**
 * Busca todos os clientes cadastrados no Supabase
 */
export async function fetchAllClients(): Promise<AccountingClient[]> {
  try {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

/**
 * Busca um cliente específico pelo ID
 */
export async function fetchClientById(id: string): Promise<AccountingClient | null> {
  if (!id) return null;
  
  try {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao buscar cliente ${id}:`, error);
    return null;
  }
}

/**
 * Adiciona um novo cliente
 */
export async function addClient(clientData: Omit<Tables<"accounting_clients">, "id" | "created_at" | "updated_at">): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('accounting_clients')
      .insert([clientData])
      .select('id')
      .single();
      
    if (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    return null;
  }
}

/**
 * Atualiza um cliente existente
 */
export async function updateClient(id: string, clientData: Partial<Tables<"accounting_clients">>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('accounting_clients')
      .update(clientData)
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${id}:`, error);
    return false;
  }
}
