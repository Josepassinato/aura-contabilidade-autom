
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";
import { uploadFile } from "@/services/supabase/storageService";
import { classifyDocument } from "@/services/fiscal/classificacao/documentClassifier";

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
  const [autoClassifyEnabled, setAutoClassifyEnabled] = useState(true);
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
        // Determine document type automatically if enabled and file is a PDF
        let actualDocType = documentType;
        if (autoClassifyEnabled && fileItem.file.type === 'application/pdf') {
          const detectedType = await detectDocumentType(fileItem.file);
          if (detectedType) {
            actualDocType = detectedType;
            console.log(`Auto-classified document as: ${detectedType}`);
          }
        }
        
        // Use the storage service for file uploads with appropriate folder
        const uploadResult = await uploadFile(clientId, fileItem.file, actualDocType);
        
        if (!uploadResult.success) {
          throw new Error(`Erro ao fazer upload de ${fileItem.name}: ${uploadResult.error}`);
        }
        
        // Register the document in the database after successful upload
        const { data, error } = await supabase
          .from('client_documents')
          .insert({
            client_id: clientId,
            name: fileItem.name,
            type: actualDocType,
            size: fileItem.size,
            file_path: uploadResult.path,
            status: autoClassifyEnabled ? 'processando' : 'pendente',
            title: fileItem.name,
            uploaded_at: new Date().toISOString()
          })
          .select();
          
        if (error) {
          throw new Error(`Erro ao registrar documento: ${error.message}`);
        }
        
        // Process the document if auto-classify is enabled
        if (autoClassifyEnabled && data?.[0]?.id) {
          await processDocument(data[0].id, uploadResult.path, actualDocType);
        }
        
        return { 
          success: true, 
          fileName: fileItem.name,
          documentId: data?.[0]?.id,
          documentType: actualDocType
        };
      });
      
      // Wait for all uploads to finish
      const results = await Promise.all(uploadPromises.map(p => p.catch(e => ({ 
        success: false, 
        error: e,
        documentId: null,
        documentType: null
      }))));
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;
      const autoClassifiedCount = results.filter(r => r.success && r.documentType !== documentType).length;
      
      let message = `${successCount} documento(s) enviado(s)`;
      if (autoClassifiedCount > 0 && autoClassifyEnabled) {
        message += ` (${autoClassifiedCount} classificado(s) automaticamente)`;
      }
      
      if (successCount > 0) {
        toast({
          title: message,
          description: autoClassifyEnabled ? 
            "Os documentos foram enviados e estão sendo processados automaticamente." :
            "Os documentos foram enviados com sucesso e aguardam processamento.",
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

  // Function to detect document type from content
  const detectDocumentType = async (file: File): Promise<string | null> => {
    try {
      // Em produção, aqui seria usado um serviço real de análise de PDF
      // Por enquanto, usa apenas o nome do arquivo
      const filename = file.name.toLowerCase();
      
      if (filename.includes('nota') || filename.includes('nf')) {
        return 'nota-fiscal';
      } else if (filename.includes('recibo')) {
        return 'recibo';
      } else if (filename.includes('contrato')) {
        return 'contrato';
      } else if (filename.includes('extrato')) {
        return 'extrato';
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao detectar tipo de documento:", error);
      return null;
    }
  };

  // Process document after upload and classification
  const processDocument = async (documentId: string, filePath: string, documentType: string): Promise<void> => {
    try {
      console.log(`Processando documento ${documentId} do tipo ${documentType}`);
      
      // For fiscal documents, use document classification service 
      if (documentType === 'nota-fiscal') {
        await classifyDocument(documentId, filePath);
      } else {
        console.log(`Documento ${documentId} registrado para revisão manual`);
      }
    } catch (error) {
      console.error(`Erro ao processar documento ${documentId}:`, error);
    }
  };

  return {
    files,
    uploading,
    documentType,
    setDocumentType,
    autoClassifyEnabled,
    setAutoClassifyEnabled,
    handleFileSelect,
    removeFile,
    handleUpload
  };
};
