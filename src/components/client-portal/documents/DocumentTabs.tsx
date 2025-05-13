
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentList } from "./DocumentList";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'pendente' | 'processado' | 'rejeitado';
  file_path?: string;
}

interface DocumentTabsProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({ 
  documents,
  onViewDocument
}) => {
  return (
    <Tabs defaultValue="todos">
      <TabsList>
        <TabsTrigger value="todos">Todos</TabsTrigger>
        <TabsTrigger value="nota-fiscal">Notas Fiscais</TabsTrigger>
        <TabsTrigger value="recibo">Recibos</TabsTrigger>
        <TabsTrigger value="contrato">Contratos</TabsTrigger>
        <TabsTrigger value="outro">Outros</TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <TabsContent value="todos">
          <DocumentList 
            documents={documents} 
            onViewDocument={onViewDocument} 
          />
        </TabsContent>
        <TabsContent value="nota-fiscal">
          <DocumentList 
            documents={documents.filter(doc => doc.type === 'nota-fiscal')}
            onViewDocument={onViewDocument} 
          />
        </TabsContent>
        <TabsContent value="recibo">
          <DocumentList 
            documents={documents.filter(doc => doc.type === 'recibo')}
            onViewDocument={onViewDocument} 
          />
        </TabsContent>
        <TabsContent value="contrato">
          <DocumentList 
            documents={documents.filter(doc => doc.type === 'contrato')}
            onViewDocument={onViewDocument} 
          />
        </TabsContent>
        <TabsContent value="outro">
          <DocumentList 
            documents={documents.filter(doc => doc.type === 'outro' || doc.type === 'extrato')}
            onViewDocument={onViewDocument} 
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
