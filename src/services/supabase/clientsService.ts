
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AccountingClient } from "@/lib/supabase";

/**
 * Busca todos os clientes cadastrados no Supabase
 */
export async function fetchAllClients(): Promise<AccountingClient[]> {
  try {
    console.log("Buscando todos os clientes cadastrados...");
    
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} clientes:`, data);
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
    console.log(`Buscando cliente com ID: ${id}`);
    
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      return null;
    }
    
    console.log(`Cliente encontrado:`, data);
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
    console.log("Adicionando novo cliente:", clientData);
    
    const { data, error } = await supabase
      .from('accounting_clients')
      .insert([clientData])
      .select('id')
      .single();
      
    if (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
    
    console.log("Cliente adicionado com sucesso, ID:", data?.id);
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
    console.log(`Atualizando cliente ${id}:`, clientData);
    
    const { error } = await supabase
      .from('accounting_clients')
      .update(clientData)
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
    
    console.log(`Cliente ${id} atualizado com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${id}:`, error);
    return false;
  }
}

/**
 * Busca clientes por termo de pesquisa
 */
export async function searchClients(searchTerm: string): Promise<AccountingClient[]> {
  try {
    console.log(`Pesquisando clientes com termo: "${searchTerm}"`);
    
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name');
      
    if (error) {
      console.error('Erro na pesquisa de clientes:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} clientes na pesquisa:`, data);
    return data || [];
  } catch (error) {
    console.error('Erro na pesquisa de clientes:', error);
    return [];
  }
}
