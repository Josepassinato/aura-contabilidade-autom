
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface DocumentsProps {
  clientId: string;
}

export const Documents = ({ clientId }: DocumentsProps) => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Balanço Patrimonial', date: '10/05/2025', type: 'contábil' },
    { id: 2, name: 'DRE', date: '10/05/2025', type: 'contábil' },
    { id: 3, name: 'Notas Fiscais Abril', date: '05/05/2025', type: 'fiscal' }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex justify-between p-2 border-b">
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.date}</p>
              </div>
              <div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {doc.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/client-documents">
            Ver Todos os Documentos
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
