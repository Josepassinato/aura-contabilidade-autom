import { supabase } from '@/integrations/supabase/client';
import { UserInvitation, UpdateInvitationData } from '@/types/invitations';
import { PaginationOptions, PaginatedResponse } from '@/types/pagination';

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
   * Lista convites pendentes com paginação
   */
  static async getPendingInvitations(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('user_invitations')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data,
      error,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Lista todos os convites com paginação
   */
  static async getAllInvitations(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('user_invitations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data,
      error,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Lista convites filtrados por status com paginação
   */
  static async getInvitationsByStatus(
    status: 'pending' | 'accepted' | 'expired',
    options?: PaginationOptions
  ): Promise<PaginatedResponse<any>> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('user_invitations')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data,
      error,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Busca convites com filtros e paginação
   */
  static async searchInvitations(
    searchTerm: string,
    options?: PaginationOptions
  ): Promise<PaginatedResponse<any>> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('user_invitations')
      .select('*', { count: 'exact' })
      .or(`email.ilike.%${searchTerm}%,invited_by_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data,
      error,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
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