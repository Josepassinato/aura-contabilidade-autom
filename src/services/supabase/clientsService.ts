
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AccountingClient } from "@/lib/supabase";

/**
 * Busca todos os clientes do contador atual
 */
export async function fetchAllClients(): Promise<AccountingClient[]> {
  try {
    console.log("Buscando clientes do contador atual...");
    
    // Obter o ID do usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Erro ao obter usuário atual:', userError);
      return [];
    }
    
    // Usar a função do banco que já aplica filtros de segurança
    const { data, error } = await supabase
      .rpc('get_accountant_clients', { accountant_user_id: user.id });
      
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} clientes do contador:`, data);
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
 * Adiciona um novo cliente associado ao contador atual
 */
export async function addClient(clientData: Omit<Tables<"accounting_clients">, "id" | "created_at" | "updated_at" | "accountant_id">): Promise<string | null> {
  try {
    console.log("Adicionando novo cliente:", clientData);
    
    // Obter o ID do usuário atual para associar como contador
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Erro ao obter usuário atual:', userError);
      return null;
    }

    // Adicionar o cliente com o accountant_id do usuário atual
    const { data, error } = await supabase
      .from('accounting_clients')
      .insert([{
        ...clientData,
        accountant_id: user.id
      }])
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
 * Busca clientes do contador atual por termo de pesquisa
 */
export async function searchClients(searchTerm: string): Promise<AccountingClient[]> {
  try {
    console.log(`Pesquisando clientes do contador com termo: "${searchTerm}"`);
    
    // Obter todos os clientes do contador atual primeiro
    const allClients = await fetchAllClients();
    
    // Filtrar localmente por termo de pesquisa
    const filteredClients = allClients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log(`Encontrados ${filteredClients.length} clientes na pesquisa:`, filteredClients);
    return filteredClients;
  } catch (error) {
    console.error('Erro na pesquisa de clientes:', error);
    return [];
  }
}
