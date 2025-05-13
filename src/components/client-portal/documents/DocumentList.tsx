
import React from "react";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'pendente' | 'processado' | 'rejeitado';
  url?: string;
  file_path?: string;
}

interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onViewDocument }) => {
  const statusBadgeStyle = (status: string) => {
    switch (status) {
      case 'processado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-300" />
        <p className="mt-2 text-lg font-medium text-gray-500">Nenhum documento encontrado</p>
        <p className="text-sm text-gray-400">Utilize o botão "Enviar Documentos" para adicionar</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="grid grid-cols-12 bg-muted px-4 py-3 rounded-t-md">
        <div className="col-span-5 font-medium text-sm">Nome do Arquivo</div>
        <div className="col-span-2 font-medium text-sm">Tipo</div>
        <div className="col-span-2 font-medium text-sm">Data</div>
        <div className="col-span-2 font-medium text-sm">Status</div>
        <div className="col-span-1 font-medium text-sm text-right">Ações</div>
      </div>
      <div className="divide-y">
        {documents.map((doc) => (
          <div key={doc.id} className="grid grid-cols-12 px-4 py-3 items-center">
            <div className="col-span-5 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.size}</p>
              </div>
            </div>
            <div className="col-span-2 text-sm">{doc.type}</div>
            <div className="col-span-2 text-sm">{doc.date}</div>
            <div className="col-span-2">
              <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeStyle(doc.status)}`}>
                {doc.status}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => onViewDocument(doc)}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
