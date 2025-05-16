
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/client-portal/DocumentUpload";
import { FileUp, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchProcessDocuments } from "@/services/fiscal/classificacao/documentClassifier";

interface ClientDocumentUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
}

export const ClientDocumentUpload = ({ clientId, onUploadComplete }: ClientDocumentUploadProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [processingDocuments, setProcessingDocuments] = useState(false);
  const { toast } = useToast();
  
  const handleUploadComplete = () => {
    // Increment refresh key to trigger document list refresh in parent component
    setRefreshKey(prev => prev + 1);
    
    if (onUploadComplete) {
      onUploadComplete();
    }
  };
  
  const handleProcessPendingDocuments = async () => {
    setProcessingDocuments(true);
    
    try {
      const processedCount = await batchProcessDocuments(clientId);
      
      if (processedCount > 0) {
        toast({
          title: `${processedCount} documento(s) processados`,
          description: "Os documentos foram classificados e registrados no sistema.",
        });
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        toast({
          title: "Nenhum documento pendente",
          description: "Não há documentos pendentes para processamento.",
        });
      }
    } catch (error) {
      console.error("Erro ao processar documentos:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar os documentos pendentes.",
        variant: "destructive"
      });
    } finally {
      setProcessingDocuments(false);
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
          Os documentos são automaticamente classificados e processados pelo sistema.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <DocumentUpload 
            clientId={clientId}
            onUploadComplete={handleUploadComplete}
          />
          
          <Button 
            variant="outline" 
            onClick={handleProcessPendingDocuments}
            disabled={processingDocuments}
          >
            <FileCheck className="mr-2 h-4 w-4" />
            {processingDocuments ? "Processando..." : "Processar Pendentes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
