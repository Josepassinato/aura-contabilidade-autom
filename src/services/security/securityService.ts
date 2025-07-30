import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/supabase';

/**
 * Serviço para operações de segurança e controle de acesso
 */
export class SecurityService {

  /**
   * Verifica se o usuário atual tem uma determinada role
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) return false;
    return data.role === role;
  }

  /**
   * Verifica se o usuário atual é admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    return await this.hasRole(userId, 'admin');
  }

  /**
   * Verifica se o usuário atual é contador
   */
  static async isAccountant(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) return false;
    return data.role === 'accountant' || data.role === 'admin';
  }

  /**
   * Verifica se o usuário pode acessar dados de um cliente específico
   */
  static async canAccessClient(userId: string, clientId: string): Promise<boolean> {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, company_id')
      .eq('user_id', userId)
      .single();

    if (error || !profile) return false;

    // Admins e contadores podem acessar qualquer cliente
    if (profile.role === 'admin' || profile.role === 'accountant') {
      return true;
    }

    // Clientes só podem acessar dados da própria empresa
    if (profile.role === 'client') {
      return profile.company_id === clientId;
    }

    return false;
  }

  /**
   * Obtém a role do usuário atual
   */
  static async getCurrentUserRole(): Promise<UserRole | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.user.id)
      .single();

    if (error || !data) return null;
    return data.role as UserRole;
  }

  /**
   * Gera token de acesso para cliente
   */
  static async generateClientAccessToken(clientId: string, description?: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const token = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('client_access_tokens')
      .insert({
        client_id: clientId,
        token,
        description: description || 'Token gerado via API',
        created_by: user.user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Valida token de acesso do cliente
   */
  static async validateClientAccessToken(token: string) {
    const { data, error } = await supabase
      .from('client_access_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    return { data, error };
  }

  /**
   * Revoga token de acesso
   */
  static async revokeClientAccessToken(tokenId: string) {
    const { data, error } = await supabase
      .from('client_access_tokens')
      .update({ is_active: false })
      .eq('id', tokenId)
      .select()
      .single();

    return { data, error };
  }
}