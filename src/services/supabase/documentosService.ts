
import { supabase } from "@/integrations/supabase/client";
import { getFileUrl } from "./storageService";

/**
 * Interface for client documents
 */
export interface ClientDocument {
  id: string;
  name: string;
  title: string;
  type: string;
  size?: number;
  file_path?: string;
  date?: string;
  status: 'pendente' | 'processado' | 'rejeitado';
  created_at?: string;
}

/**
 * Fetches documents for a client
 * @param clientId Client ID
 * @param limit Optional limit of documents to return
 */
export async function fetchClientDocuments(clientId: string, limit?: number): Promise<ClientDocument[]> {
  try {
    if (!clientId) {
      throw new Error("Client ID not provided");
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

    // Map data to the expected format for the component, ensuring default status is 'pendente'
    return data.map(doc => {
      // Check if doc.status exists and has a valid value
      let docStatus: 'pendente' | 'processado' | 'rejeitado' = 'pendente';
      if (doc.status && ['pendente', 'processado', 'rejeitado'].includes(doc.status)) {
        docStatus = doc.status as 'pendente' | 'processado' | 'rejeitado';
      }
      
      return {
        id: doc.id,
        title: doc.title,
        name: doc.name || doc.title,
        type: doc.type,
        size: doc.size,
        file_path: doc.file_path,
        date: doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : undefined,
        status: docStatus,
        created_at: doc.created_at
      };
    });

  } catch (error) {
    console.error('Error fetching client documents:', error);
    return [];
  }
}

/**
 * Adds a new client document
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
      throw new Error("Client ID not provided");
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
          file_path: document.file_path,
          status: 'pendente' // Explicitly set status as pendente
        }
      ])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data?.id || null;

  } catch (error) {
    console.error('Error adding client document:', error);
    return null;
  }
}

/**
 * Gets a signed URL for viewing a document
 * @param document The document to view
 * @returns URL to view the document or null if there was an error
 */
export async function getDocumentViewUrl(document: ClientDocument): Promise<string | null> {
  if (!document.file_path) return null;
  
  return getFileUrl(document.file_path);
}

