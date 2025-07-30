import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/lib/supabase';

/**
 * Serviço para operações relacionadas ao perfil do usuário
 */
export class UserProfileService {

  /**
   * Busca perfil do usuário por ID
   */
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  }

  /**
   * Cria um novo perfil de usuário
   */
  static async createUserProfile(profile: {
    user_id: string;
    full_name: string;
    email: string;
    role: UserRole;
    company_id?: string;
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Atualiza perfil do usuário
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Lista todos os perfis de usuário (apenas admins)
   */
  static async getAllUserProfiles() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Busca perfis por role
   */
  static async getUserProfilesByRole(role: UserRole) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', role)
      .order('full_name', { ascending: true });

    return { data, error };
  }
}