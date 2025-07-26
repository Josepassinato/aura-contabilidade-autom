import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Brain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  classification?: {
    category: string;
    confidence: number;
    tags: string[];
    suggested_actions: string[];
  };
}

interface AIDocumentClassifierProps {
  documents: Document[];
  onClassificationComplete?: (results: Document[]) => void;
}

export function AIDocumentClassifier({ documents, onClassificationComplete }: AIDocumentClassifierProps) {
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifiedDocs, setClassifiedDocs] = useState<Document[]>(documents);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const classifyDocuments = async () => {
    setIsClassifying(true);
    setProgress(0);
    
    try {
      const results: Document[] = [];
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        // Chamar edge function para classificação com IA
        const { data, error } = await supabase.functions.invoke('classify-document-ai', {
          body: {
            documentUrl: doc.url,
            documentName: doc.name,
            documentType: doc.type
          }
        });

        if (error) {
          console.error('Erro na classificação:', error);
          results.push(doc);
        } else {
          results.push({
            ...doc,
            classification: data.classification
          });
        }

        setProgress(((i + 1) / documents.length) * 100);
      }

      setClassifiedDocs(results);
      onClassificationComplete?.(results);
      
      toast({
        title: "Classificação concluída",
        description: `${results.length} documentos foram classificados com IA.`,
      });
      
    } catch (error) {
      console.error('Erro na classificação:', error);
      toast({
        title: "Erro na classificação",
        description: "Ocorreu um erro ao classificar os documentos.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "Alta";
    if (confidence >= 0.6) return "Média";
    return "Baixa";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Classificador IA de Documentos
          </CardTitle>
          <CardDescription>
            Use inteligência artificial para classificar automaticamente documentos contábeis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {documents.length} documento(s) para classificar
              </span>
            </div>
            <Button 
              onClick={classifyDocuments}
              disabled={isClassifying || documents.length === 0}
              className="flex items-center gap-2"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Classificando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Classificar com IA
                </>
              )}
            </Button>
          </div>

          {isClassifying && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% concluído
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {classifiedDocs.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {doc.classification ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Classificado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pendente</span>
                  </div>
                )}
              </div>

              {doc.classification && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{doc.classification.category}</Badge>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getConfidenceColor(doc.classification.confidence)}`} />
                      <span className="text-sm text-muted-foreground">
                        Confiança: {getConfidenceText(doc.classification.confidence)} ({(doc.classification.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {doc.classification.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.classification.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {doc.classification.suggested_actions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ações sugeridas:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {doc.classification.suggested_actions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}