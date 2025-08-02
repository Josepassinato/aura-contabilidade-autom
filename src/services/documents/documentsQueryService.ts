import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para consultas relacionadas aos documentos
 */
export class DocumentsQueryService {

  /**
   * Lista documentos de um cliente específico
   */
  static async getClientDocuments(clientId: string) {
    const { data, error } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Lista todos os documentos (para admins e contadores)
   */
  static async getAllDocuments() {
    const { data, error } = await supabase
      .from('client_documents')
      .select(`
        *,
        accounting_clients (
          name,
          cnpj
        )
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Busca documento por ID
   */
  static async getDocumentById(documentId: string) {
    const { data, error } = await supabase
      .from('client_documents')
      .select(`
        *,
        accounting_clients (
          name,
          cnpj
        )
      `)
      .eq('id', documentId)
      .single();

    return { data, error };
  }

  /**
   * Cria um novo documento
   */
  static async createDocument(document: {
    client_id: string;
    name: string;
    title?: string;
    type: string;
    file_path: string;
    size?: number;
    status?: string;
  }) {
    // Garantir que todos os campos obrigatórios estejam presentes
    const documentData = {
      client_id: document.client_id,
      name: document.name,
      title: document.title || document.name,
      type: document.type,
      file_path: document.file_path,
      size: document.size || 0,
      status: document.status || 'uploaded',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserindo documento:', documentData);

    const { data, error } = await supabase
      .from('client_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir documento:', error);
    } else {
      console.log('Documento inserido com sucesso:', data);
    }

    return { data, error };
  }

  /**
   * Atualiza documento
   */
  static async updateDocument(documentId: string, updates: Partial<{
    name: string;
    title: string;
    type: string;
    status: string;
  }>) {
    const { data, error } = await supabase
      .from('client_documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Remove documento
   */
  static async deleteDocument(documentId: string) {
    const { data, error } = await supabase
      .from('client_documents')
      .delete()
      .eq('id', documentId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Lista documentos por tipo
   */
  static async getDocumentsByType(type: string, clientId?: string) {
    let query = supabase
      .from('client_documents')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    return await query;
  }

  /**
   * Busca documentos por tags
   */
  static async getDocumentsByTags(tags: string[], clientId?: string) {
    let query = supabase
      .from('client_documents')
      .select('*')
      .overlaps('tags', tags)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    return await query;
  }

  /**
   * Estatísticas de documentos
   */
  static async getDocumentStats(clientId?: string) {
    let query = supabase
      .from('client_documents')
      .select('type, size');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    const stats = data?.reduce((acc, doc) => {
      acc.total = (acc.total || 0) + 1;
      acc.totalSize = (acc.totalSize || 0) + (doc.size || 0);
      acc.byType = acc.byType || {};
      acc.byType[doc.type] = (acc.byType[doc.type] || 0) + 1;
      
      return acc;
    }, {} as any) || {};

    return { data: stats, error: null };
  }
}