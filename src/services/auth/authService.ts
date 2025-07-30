import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/lib/supabase';

/**
 * Serviço centralizado para operações de autenticação
 */
export class AuthService {
  
  /**
   * Realiza login com email e senha
   */
  static async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
   * Realiza logout
   */
  static async signOut(options?: { scope?: 'global' | 'local' }) {
    return await supabase.auth.signOut(options);
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