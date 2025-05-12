
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
// Do not use supabase typings until the tables are created in database
// import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  name: string;
  date: string;
  type: string;
}

interface DocumentsProps {
  clientId: string;
}

export const Documents = ({ clientId }: DocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!clientId) return;

      setIsLoading(true);
      try {
        // Use mock data since the client_documents table doesn't exist yet
        // When the table is created, we can uncomment this code
        /*
        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        if (data) {
          // Mapear dados para o formato esperado pelo componente
          const mappedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.name || doc.title || 'Documento sem título',
            date: new Date(doc.created_at).toLocaleDateString('pt-BR'),
            type: doc.type || 'documento'
          }));
          
          setDocuments(mappedDocs);
        }
        */
        
        // Use mock data for now
        setDocuments([
          { id: '1', name: 'Balanço Patrimonial', date: '10/05/2025', type: 'contábil' },
          { id: '2', name: 'DRE', date: '10/05/2025', type: 'contábil' },
          { id: '3', name: 'Notas Fiscais Abril', date: '05/05/2025', type: 'fiscal' }
        ]);
      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        
        // Fallback to mock data in case of error
        setDocuments([
          { id: '1', name: 'Balanço Patrimonial', date: '10/05/2025', type: 'contábil' },
          { id: '2', name: 'DRE', date: '10/05/2025', type: 'contábil' },
          { id: '3', name: 'Notas Fiscais Abril', date: '05/05/2025', type: 'fiscal' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [clientId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Carregando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Nenhum documento encontrado</p>
          </div>
        ) : (
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
        )}
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
