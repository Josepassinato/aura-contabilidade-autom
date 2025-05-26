
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface UseEcacXmlUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export function useEcacXmlUpload({ clientId, onUploadComplete }: UseEcacXmlUploadProps) {
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

    setUploading(true);

    try {
      // Simular processamento do arquivo XML da Receita Federal
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Upload realizado",
        description: `Arquivo XML da Receita Federal processado com sucesso`,
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
      console.error('Erro no upload XML e-CAC:', error);
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
