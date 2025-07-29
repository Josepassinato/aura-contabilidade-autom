
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/utils/logger";

interface DocumentsProps {
  clientId: string;
}

interface ClientDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  created_at: string;
}

export const Documents = ({ clientId }: DocumentsProps) => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!clientId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('client_documents')
          .select('id, name, type, created_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          logger.error('Erro ao buscar documentos:', error, 'Documents');
          setDocuments([]);
          return;
        }

        if (data) {
          const formattedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            date: new Date(doc.created_at).toLocaleDateString('pt-BR'),
            created_at: doc.created_at
          }));
          setDocuments(formattedDocs);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        logger.error('Erro ao buscar documentos:', error, 'Documents');
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
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
