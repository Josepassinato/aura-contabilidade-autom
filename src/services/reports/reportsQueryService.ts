import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para consultas relacionadas aos relatórios
 */
export class ReportsQueryService {

  /**
   * Lista relatórios de um cliente específico
   */
  static async getClientReports(clientId: string) {
    const { data, error } = await supabase
      .from('generated_reports')
      .select(`
        *,
        accounting_clients (
          id,
          name,
          accounting_firms (
            name,
            cnpj,
            phone,
            email
          )
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Lista todos os relatórios (para admins e contadores)
   */
  static async getAllReports() {
    const { data, error } = await supabase
      .from('generated_reports')
      .select(`
        *,
        accounting_clients (
          id,
          name,
          accounting_firms (
            name,
            cnpj,
            phone,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Busca um relatório específico por ID
   */
  static async getReportById(reportId: string) {
    const { data, error } = await supabase
      .from('generated_reports')
      .select(`
        *,
        accounting_clients (
          id,
          name,
          cnpj,
          email
        )
      `)
      .eq('id', reportId)
      .single();

    return { data, error };
  }

  /**
   * Cria um novo relatório
   */
  static async createReport(report: {
    title: string;
    description?: string;
    report_type: string;
    client_id: string;
    file_path?: string;
    file_url?: string;
    file_format?: string;
    tags?: string[];
    expires_at?: string;
    client_email?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('generated_reports')
      .insert({
        ...report,
        created_by: user.user?.id || null,
        generation_status: 'pending'
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Atualiza status de um relatório
   */
  static async updateReportStatus(reportId: string, status: string, errorMessage?: string) {
    const updates: any = { generation_status: status };
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { data, error } = await supabase
      .from('generated_reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Incrementa contador de downloads
   */
  static async incrementDownloadCount(reportId: string) {
    // Primeiro buscar o valor atual
    const { data: currentReport, error: fetchError } = await supabase
      .from('generated_reports')
      .select('download_count')
      .eq('id', reportId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    // Incrementar o valor
    const newCount = (currentReport.download_count || 0) + 1;
    
    const { data, error } = await supabase
      .from('generated_reports')
      .update({ download_count: newCount })
      .eq('id', reportId)
      .select('download_count')
      .single();

    return { data, error };
  }

  /**
   * Lista relatórios próximos do vencimento
   */
  static async getExpiringReports(daysFromNow: number = 7) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysFromNow);

    const { data, error } = await supabase
      .from('generated_reports')
      .select('*')
      .not('expires_at', 'is', null)
      .lte('expires_at', expirationDate.toISOString())
      .eq('is_public', true)
      .order('expires_at', { ascending: true });

    return { data, error };
  }

  /**
   * Remove relatórios expirados
   */
  static async cleanupExpiredReports() {
    const { data, error } = await supabase
      .from('generated_reports')
      .update({ is_public: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_public', true)
      .select();

    return { data, error };
  }
}