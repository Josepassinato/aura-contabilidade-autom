import { supabase } from '@/integrations/supabase/client';
import { UserInvitation, UpdateInvitationData } from '@/types/invitations';

/**
 * Serviço para operações relacionadas aos convites de usuário
 */
export class UserInvitationService {

  /**
   * Valida um convite por token
   */
  static async validateInvitation(token: string) {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('id, email, role, invited_by_name, expires_at')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    return { data, error };
  }

  /**
   * Busca convite por ID
   */
  static async getInvitationById(invitationId: string) {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    return { data, error };
  }

  /**
   * Atualiza status do convite
   */
  static async updateInvitationStatus(invitationId: string, updates: UpdateInvitationData) {
    const { data, error } = await supabase
      .from('user_invitations')
      .update(updates)
      .eq('id', invitationId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Cria um novo convite
   */
  static async createInvitation(invitation: {
    email: string;
    role: string;
    token: string;
    invited_by: string;
    invited_by_name: string;
    expires_at: string;
  }) {
    const { data, error } = await supabase
      .from('user_invitations')
      .insert(invitation)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Lista convites pendentes
   */
  static async getPendingInvitations() {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Lista todos os convites
   */
  static async getAllInvitations() {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Remove convites expirados
   */
  static async cleanupExpiredInvitations() {
    const { data, error } = await supabase
      .from('user_invitations')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .eq('status', 'pending');

    return { data, error };
  }
}