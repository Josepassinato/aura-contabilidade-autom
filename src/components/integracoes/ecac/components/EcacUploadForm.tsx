
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUp } from "lucide-react";
import { EcacFileInput } from './EcacFileInput';
import { EcacDocumentTypeSelector } from './EcacDocumentTypeSelector';

interface EcacUploadFormProps {
  selectedFile: File | null;
  tipoDocumento: string;
  description: string;
  uploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTipoDocumentoChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUpload: () => void;
}

export function EcacUploadForm({
  selectedFile,
  tipoDocumento,
  description,
  uploading,
  onFileSelect,
  onTipoDocumentoChange,
  onDescriptionChange,
  onUpload
}: EcacUploadFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EcacFileInput
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          disabled={uploading}
        />

        <EcacDocumentTypeSelector
          value={tipoDocumento}
          onValueChange={onTipoDocumentoChange}
          disabled={uploading}
        />

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Descreva o conteúdo do arquivo XML..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={uploading}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onUpload} 
          disabled={uploading || !selectedFile || !tipoDocumento}
          className="min-w-32"
        >
          {uploading ? (
            "Processando..."
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Enviar XML
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
