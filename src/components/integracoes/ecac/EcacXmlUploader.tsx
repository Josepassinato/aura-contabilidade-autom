
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEcacXmlUpload } from './hooks/useEcacXmlUpload';
import { EcacUploadForm } from './components/EcacUploadForm';

interface EcacXmlUploaderProps {
  clientId: string;
  clientName?: string;
  onUploadComplete?: () => void;
}

export function EcacXmlUploader({ clientId, clientName, onUploadComplete }: EcacXmlUploaderProps) {
  const {
    selectedFile,
    tipoDocumento,
    setTipoDocumento,
    description,
    setDescription,
    uploading,
    handleFileSelect,
    handleUpload
  } = useEcacXmlUpload({ clientId, onUploadComplete });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Manual de XML e-CAC
          {clientName && <span className="text-sm font-normal">- {clientName}</span>}
        </CardTitle>
        <CardDescription>
          Envie arquivos XML obtidos manualmente do e-CAC da Receita Federal
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta funcionalidade deve ser usada para processar arquivos XML baixados 
            manualmente do e-CAC quando as integrações automáticas estiverem indisponíveis.
          </AlertDescription>
        </Alert>

        <EcacUploadForm
          selectedFile={selectedFile}
          tipoDocumento={tipoDocumento}
          description={description}
          uploading={uploading}
          onFileSelect={handleFileSelect}
          onTipoDocumentoChange={setTipoDocumento}
          onDescriptionChange={setDescription}
          onUpload={handleUpload}
        />
      </CardContent>
    </Card>
  );
}
