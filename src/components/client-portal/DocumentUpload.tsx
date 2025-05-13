
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUp } from "lucide-react";
import { useDocumentUpload } from "./document-upload/useDocumentUpload";
import { FileList } from "./document-upload/FileList";
import { FileUploader } from "./document-upload/FileUploader";
import { DocumentTypeSelector } from "./document-upload/DocumentTypeSelector";

interface DocumentUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export const DocumentUpload = ({ clientId, onUploadComplete }: DocumentUploadProps) => {
  const [open, setOpen] = useState(false);
  
  const {
    files,
    uploading,
    documentType,
    setDocumentType,
    handleFileSelect,
    removeFile,
    handleUpload
  } = useDocumentUpload({ 
    clientId,
    onUploadComplete: () => {
      if (onUploadComplete) {
        onUploadComplete();
      }
      setOpen(false);
    }
  });

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(e.target.value);
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
            <DocumentTypeSelector 
              documentType={documentType} 
              onTypeChange={handleTypeChange} 
            />
            
            <FileUploader 
              onFileSelect={handleFileSelect} 
              uploading={uploading} 
            />
            
            <FileList 
              files={files}
              onRemoveFile={removeFile}
              uploading={uploading}
            />
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
