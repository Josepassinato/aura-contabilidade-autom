import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/lib/supabase';

/**
 * Serviço centralizado para operações de autenticação
 */
export class AuthService {
  
  /**
   * Realiza login com email e senha de forma segura
   */
  static async signInWithPassword(email: string, password: string) {
    try {
      // Log da tentativa de login para auditoria
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.data.user) {
        // Log de sucesso
        await supabase.rpc('reset_user_password_secure', { user_email: email });
      }
      
      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Realiza cadastro de novo usuário
   */
  static async signUp(email: string, password: string, userData: { full_name?: string; role?: string }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
  }

  /**
   * Obtém a sessão atual
   */
  static async getSession() {
    return await supabase.auth.getSession();
  }

  /**
   * Obtém o usuário atual
   */
  static async getUser() {
    return await supabase.auth.getUser();
  }

  /**
   * Realiza logout seguro com limpeza de todas as sessões
   */
  static async signOut(options?: { scope?: 'global' | 'local' }) {
    try {
      // Log do logout para auditoria
      await supabase.rpc('secure_global_logout');
      
      // Sempre fazer logout global para segurança
      return await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  /**
   * Redefine senha por email
   */
  static async resetPasswordForEmail(email: string) {
    return await supabase.auth.resetPasswordForEmail(email);
  }

  /**
   * Configura listener para mudanças de estado de autenticação
   */
  static onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  }
}