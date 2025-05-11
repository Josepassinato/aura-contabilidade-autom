
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUp, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File; // Armazenar o arquivo real para upload
}

interface DocumentUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export const DocumentUpload = ({ clientId, onUploadComplete }: DocumentUploadProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState("nota-fiscal");
  const [open, setOpen] = useState(false);
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
        const fileExt = fileItem.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${clientId}/${documentType}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('client-documents')
          .upload(filePath, fileItem.file);
          
        if (uploadError) {
          throw new Error(`Erro ao fazer upload de ${fileItem.name}: ${uploadError.message}`);
        }
        
        // Registrar o documento no banco de dados após upload bem-sucedido
        const { error: insertError } = await supabase
          .from('client_documents')
          .insert({
            client_id: clientId,
            name: fileItem.name,
            type: documentType,
            size: fileItem.size,
            file_path: filePath,
            status: 'pendente',
            uploaded_at: new Date().toISOString()
          });
          
        if (insertError) {
          throw new Error(`Erro ao registrar documento: ${insertError.message}`);
        }
        
        return { success: true, fileName: fileItem.name };
      });
      
      // Aguardar todos os uploads terminarem
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
      setOpen(false);
      
      if (onUploadComplete && successCount > 0) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Erro geral ao fazer upload:", error);
      toast({
        title: "Falha no upload",
        description: "Ocorreu um erro ao enviar os arquivos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileUp className="mr-2 h-4 w-4" />
          Enviar Documentos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Enviar Documentos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
              <label htmlFor="document-type" className="text-sm font-medium">
                Tipo de Documento
              </label>
              <select
                id="document-type"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="nota-fiscal">Nota Fiscal</option>
                <option value="recibo">Recibo</option>
                <option value="contrato">Contrato</option>
                <option value="extrato">Extrato Bancário</option>
                <option value="outro">Outros Documentos</option>
              </select>
            </div>
            
            <div className="col-span-4">
              <label className="block text-sm font-medium mb-2">
                Selecionar Arquivos
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  disabled={uploading}
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <FileText className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Clique para selecionar ou arraste arquivos
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, DOC, XLS (max. 10MB)
                  </p>
                </label>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="col-span-4">
                <h3 className="font-medium mb-2">Arquivos Selecionados:</h3>
                <div className="max-h-40 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[300px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="text-gray-500 hover:text-red-500"
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
              {uploading ? "Enviando..." : "Enviar Documentos"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
