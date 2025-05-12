
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para documentos do cliente
 */
export interface ClientDocument {
  id: string;
  name: string;
  title: string;
  type: string;
  size?: number;
  file_path?: string;
  date?: string;
  status?: 'pendente' | 'processado' | 'rejeitado';
  created_at?: string;
}

/**
 * Busca documentos de um cliente
 * @param clientId ID do cliente
 * @param limit Limite de documentos a serem retornados (opcional)
 */
export async function fetchClientDocuments(clientId: string, limit?: number): Promise<ClientDocument[]> {
  try {
    if (!clientId) {
      throw new Error("ID do cliente não informado");
    }

    let query = supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (limit) {
      query = query.limit(limit);
    }
      
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Mapear os dados para o formato esperado pelo componente
    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      name: doc.name || doc.title,
      type: doc.type,
      size: doc.size,
      file_path: doc.file_path,
      date: doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : undefined,
      status: 'processado' as 'pendente' | 'processado' | 'rejeitado',
      created_at: doc.created_at
    }));

  } catch (error) {
    console.error('Erro ao buscar documentos do cliente:', error);
    return [];
  }
}

/**
 * Adiciona um novo documento do cliente
 */
export async function addClientDocument(
  clientId: string,
  document: {
    title: string;
    name: string;
    type: string;
    size?: number;
    file_path?: string;
  }
): Promise<string | null> {
  try {
    if (!clientId) {
      throw new Error("ID do cliente não informado");
    }

    const { data, error } = await supabase
      .from('client_documents')
      .insert([
        {
          client_id: clientId,
          title: document.title,
          name: document.name,
          type: document.type,
          size: document.size,
          file_path: document.file_path
        }
      ])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data?.id || null;

  } catch (error) {
    console.error('Erro ao adicionar documento do cliente:', error);
    return null;
  }
}
