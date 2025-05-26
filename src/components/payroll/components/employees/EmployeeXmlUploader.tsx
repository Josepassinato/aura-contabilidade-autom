
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmployeeXmlUpload } from './hooks/useEmployeeXmlUpload';
import { EmployeeUploadForm } from './EmployeeUploadForm';

interface EmployeeXmlUploaderProps {
  clientId?: string;
  clientName?: string;
  onUploadComplete?: () => void;
}

export function EmployeeXmlUploader({ clientId, clientName, onUploadComplete }: EmployeeXmlUploaderProps) {
  const {
    selectedFile,
    tipoDocumento,
    setTipoDocumento,
    description,
    setDescription,
    uploading,
    handleFileSelect,
    handleUpload
  } = useEmployeeXmlUpload({ clientId, onUploadComplete });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Upload de XML - Funcionários
          {clientName && <span className="text-sm font-normal">- {clientName}</span>}
        </CardTitle>
        <CardDescription>
          Envie arquivos XML relacionados a dados de funcionários (folha, rescisões, eSocial, etc.)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta funcionalidade processa arquivos XML relacionados a funcionários como folha de pagamento,
            rescisões, dados do eSocial, RAIS, CAGED, entre outros.
          </AlertDescription>
        </Alert>

        <EmployeeUploadForm
          selectedFile={selectedFile}
          tipoDocumento={tipoDocumento}
          description={description}
          uploading={uploading}
          clientId={clientId}
          onFileSelect={handleFileSelect}
          onTipoDocumentoChange={setTipoDocumento}
          onDescriptionChange={setDescription}
          onUpload={handleUpload}
        />
      </CardContent>
    </Card>
  );
}
