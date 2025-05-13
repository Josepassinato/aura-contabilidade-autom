
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface for file upload response
 */
export interface FileUploadResponse {
  path: string;
  size: number;
  success: boolean;
  error?: string;
}

/**
 * Uploads a file to Supabase Storage
 * @param clientId ID do cliente
 * @param file File to upload
 * @param documentType Type of document
 * @returns FileUploadResponse object
 */
export async function uploadFile(
  clientId: string,
  file: File,
  documentType: string
): Promise<FileUploadResponse> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${clientId}/${documentType}/${fileName}`;
    
    const { error, data } = await supabase.storage
      .from('client-documents')
      .upload(filePath, file);
      
    if (error) {
      console.error("Error uploading file:", error);
      return {
        path: "",
        size: 0,
        success: false,
        error: error.message
      };
    }
    
    return {
      path: filePath,
      size: file.size,
      success: true
    };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return {
      path: "",
      size: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Gets a signed URL for a file in Supabase Storage
 * @param filePath Path to the file
 * @param expiresIn Expiration time in seconds (default: 60)
 * @returns URL to the file or null if there was an error
 */
export async function getFileUrl(filePath: string, expiresIn: number = 60): Promise<string | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    if (!filePath) {
      throw new Error("File path is required");
    }
    
    const { data, error } = await supabase.storage
      .from('client-documents')
      .createSignedUrl(filePath, expiresIn);
      
    if (error) {
      throw error;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error("Error getting file URL:", error);
    return null;
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param filePath Path to the file
 * @returns boolean indicating success or failure
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (!supabase) {
      return false;
    }

    const { error } = await supabase.storage
      .from('client-documents')
      .remove([filePath]);
      
    return !error;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Lists all files in a folder
 * @param clientId ID do cliente
 * @param documentType Type of document (optional)
 * @returns Array of file objects or empty array if there was an error
 */
export async function listFiles(clientId: string, documentType?: string): Promise<any[]> {
  try {
    if (!supabase) {
      return [];
    }

    const folderPath = documentType 
      ? `${clientId}/${documentType}` 
      : `${clientId}`;
    
    const { data, error } = await supabase.storage
      .from('client-documents')
      .list(folderPath);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}

