
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/client-portal/DocumentUpload";
import { FileUp } from "lucide-react";

interface ClientDocumentUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export const ClientDocumentUpload = ({ clientId, onUploadComplete }: ClientDocumentUploadProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadComplete = () => {
    // Increment refresh key to trigger document list refresh in parent component
    setRefreshKey(prev => prev + 1);
    
    if (onUploadComplete) {
      onUploadComplete();
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Envio de Documentos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          Envie documentos fiscais, contratos, recibos e outros documentos diretamente para o seu contador.
        </p>
        
        <DocumentUpload 
          clientId={clientId}
          onUploadComplete={handleUploadComplete}
        />
      </CardContent>
    </Card>
  );
};
