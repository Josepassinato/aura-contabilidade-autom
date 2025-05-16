import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";
import { uploadFile } from "@/services/supabase/storageService";

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface UseDocumentUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export const useDocumentUpload = ({ clientId, onUploadComplete }: UseDocumentUploadProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState("nota-fiscal");
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const fileList = Array.from(e.target.files);
    const newFiles = fileList.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione pelo menos um arquivo para enviar.",
        variant: "destructive"
      });
      return;
    }

    if (!supabase) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao Supabase. Verifique sua configuração.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (fileItem) => {
        // Use the storage service for file uploads
        const uploadResult = await uploadFile(clientId, fileItem.file, documentType);
        
        if (!uploadResult.success) {
          throw new Error(`Erro ao fazer upload de ${fileItem.name}: ${uploadResult.error}`);
        }
        
        // Register the document in the database after successful upload
        const result = await supabase
          .from('client_documents')
          .insert({
            client_id: clientId,
            name: fileItem.name,
            type: documentType,
            size: fileItem.size,
            file_path: uploadResult.path,
            status: 'pendente',
            title: fileItem.name,
            uploaded_at: new Date().toISOString()
          });
          
        if (result.error) {
          throw new Error(`Erro ao registrar documento: ${result.error.message}`);
        }
        
        return { success: true, fileName: fileItem.name };
      });
      
      // Wait for all uploads to finish
      const results = await Promise.all(uploadPromises.map(p => p.catch(e => ({ success: false, error: e }))));
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;
      
      if (successCount > 0) {
        toast({
          title: `${successCount} documento(s) enviado(s)`,
          description: "Os documentos foram enviados com sucesso e estão sendo processados.",
        });
      }
      
      if (errorCount > 0) {
        toast({
          title: `${errorCount} documento(s) com falha`,
          description: "Alguns documentos não puderam ser enviados. Por favor, tente novamente.",
          variant: "destructive"
        });
      }
      
      setFiles([]);
      
      if (onUploadComplete && successCount > 0) {
        onUploadComplete();
      }

      return successCount > 0;
    } catch (error) {
      console.error("Erro geral ao fazer upload:", error);
      toast({
        title: "Falha no upload",
        description: "Ocorreu um erro ao enviar os arquivos. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    files,
    uploading,
    documentType,
    setDocumentType,
    handleFileSelect,
    removeFile,
    handleUpload
  };
};
