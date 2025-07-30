import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para consultas relacionadas aos clientes
 */
export class ClientsQueryService {

  /**
   * Lista todos os clientes de um contador
   */
  static async getAccountantClients(accountantId: string) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj, email, status, regime, created_at')
      .eq('accountant_id', accountantId)
      .order('name', { ascending: true });

    return { data, error };
  }

  /**
   * Lista todos os clientes (apenas para admins)
   */
  static async getAllClients() {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select(`
        *,
        accounting_firms (
          name,
          cnpj,
          email,
          phone
        )
      `)
      .order('name', { ascending: true });

    return { data, error };
  }

  /**
   * Busca cliente por ID
   */
  static async getClientById(clientId: string) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select(`
        *,
        accounting_firms (
          name,
          cnpj,
          email,
          phone
        )
      `)
      .eq('id', clientId)
      .single();

    return { data, error };
  }

  /**
   * Busca cliente por CNPJ
   */
  static async getClientByCnpj(cnpj: string) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('*')
      .eq('cnpj', cnpj)
      .single();

    return { data, error };
  }

  /**
   * Cria um novo cliente
   */
  static async createClient(client: {
    name: string;
    cnpj: string;
    email: string;
    accountant_id: string;
    status?: string;
    regime: string;
    phone?: string;
    address?: string;
  }) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .insert(client)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Atualiza dados de um cliente
   */
  static async updateClient(clientId: string, updates: Partial<{
    name: string;
    cnpj: string;
    email: string;
    status: string;
    regime: string;
    phone: string;
    address: string;
  }>) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Remove um cliente
   */
  static async deleteClient(clientId: string) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .delete()
      .eq('id', clientId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Lista clientes por status
   */
  static async getClientsByStatus(status: string) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj, email, regime, created_at')
      .eq('status', status)
      .order('name', { ascending: true });

    return { data, error };
  }

  /**
   * Lista clientes por regime tributário
   */
  static async getClientsByRegime(regime: string) {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj, email, status, created_at')
      .eq('regime', regime)
      .order('name', { ascending: true });

    return { data, error };
  }

  /**
   * Estatísticas de clientes
   */
  static async getClientStats() {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('status, regime')
      .then(({ data, error }) => {
        if (error) return { data: null, error };

        const stats = data?.reduce((acc, client) => {
          acc.total = (acc.total || 0) + 1;
          acc.byStatus = acc.byStatus || {};
          acc.byRegime = acc.byRegime || {};
          
          acc.byStatus[client.status] = (acc.byStatus[client.status] || 0) + 1;
          acc.byRegime[client.regime] = (acc.byRegime[client.regime] || 0) + 1;
          
          return acc;
        }, {} as any) || {};

        return { data: stats, error: null };
      });

    return { data, error };
  }
}