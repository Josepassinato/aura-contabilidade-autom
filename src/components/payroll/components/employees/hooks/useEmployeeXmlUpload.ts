
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface UseEmployeeXmlUploadProps {
  clientId?: string;
  onUploadComplete?: () => void;
}

export function useEmployeeXmlUpload({ clientId, onUploadComplete }: UseEmployeeXmlUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo XML
      if (!file.name.toLowerCase().endsWith('.xml')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos XML",
          variant: "destructive"
        });
        return;
      }

      // Verificar tamanho do arquivo (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipoDocumento) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o arquivo XML e o tipo de documento",
        variant: "destructive"
      });
      return;
    }

    if (!clientId) {
      toast({
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de fazer o upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Simular processamento do arquivo XML de funcionários
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Upload realizado",
        description: `Arquivo XML de funcionários processado com sucesso`,
      });

      // Limpar form
      setSelectedFile(null);
      setTipoDocumento('');
      setDescription('');

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Erro no upload XML funcionários:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível processar o arquivo XML",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedFile,
    tipoDocumento,
    setTipoDocumento,
    description,
    setDescription,
    uploading,
    handleFileSelect,
    handleUpload
  };
}
