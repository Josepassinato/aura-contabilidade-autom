
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Uploads a procuração document to Supabase Storage
 * @param clientId ID do cliente
 * @param procuracaoId ID da procuração
 * @param file Arquivo do comprovante de procuração
 * @returns URL do arquivo ou null em caso de erro
 */
export async function uploadProcuracaoDocument(
  clientId: string,
  procuracaoId: string,
  file: File
): Promise<string | null> {
  try {
    if (!file) return null;
    
    // Criar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${clientId}/${procuracaoId}_${Date.now()}.${fileExtension}`;
    
    // Upload do arquivo para o bucket de procurações
    const { data, error } = await supabase.storage
      .from('procuracoes')
      .upload(fileName, file);
    
    if (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      toast({
        title: "Erro no upload",
        description: `Não foi possível fazer upload do comprovante: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
    
    // Gerar URL pública para o arquivo
    const { data: urlData } = await supabase.storage
      .from('procuracoes')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // URL válida por 1 ano
    
    return urlData?.signedUrl || null;
  } catch (error: any) {
    console.error('Erro ao processar upload:', error);
    toast({
      title: "Erro no processamento",
      description: `Falha no processamento do arquivo: ${error.message}`,
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Obtém a URL assinada para um documento de procuração
 * @param filePath Caminho do arquivo no storage
 * @returns URL assinada ou null em caso de erro
 */
export async function getProcuracaoDocumentUrl(filePath: string): Promise<string | null> {
  try {
    if (!filePath) return null;
    
    const { data, error } = await supabase.storage
      .from('procuracoes')
      .createSignedUrl(filePath, 60 * 60); // URL válida por 1 hora
      
    if (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Erro ao obter URL do documento:', error);
    return null;
  }
}

/**
 * Remove um documento de procuração do storage
 * @param filePath Caminho do arquivo no storage
 * @returns boolean indicando sucesso ou falha
 */
export async function deleteProcuracaoDocument(filePath: string): Promise<boolean> {
  try {
    if (!filePath) return false;
    
    const { error } = await supabase.storage
      .from('procuracoes')
      .remove([filePath]);
      
    if (error) {
      console.error('Erro ao excluir arquivo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao processar exclusão:', error);
    return false;
  }
}
