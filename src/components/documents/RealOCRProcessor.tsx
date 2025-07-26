import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedOCRData {
  tipo_documento?: string;
  numero_documento?: string;
  data_emissao?: string;
  data_vencimento?: string;
  emissor?: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
  };
  destinatario?: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
  };
  valores?: {
    valor_total?: number;
    valor_liquido?: number;
    base_calculo_icms?: number;
    valor_icms?: number;
    base_calculo_ipi?: number;
    valor_ipi?: number;
    valor_pis?: number;
    valor_cofins?: number;
    valor_iss?: number;
  };
  itens?: Array<{
    descricao?: string;
    quantidade?: number;
    valor_unitario?: number;
    valor_total?: number;
    ncm?: string;
    cfop?: string;
  }>;
  observacoes?: string;
  chave_acesso?: string;
  raw_text?: string;
}

interface RealOCRProcessorProps {
  documentId: string;
  clientId: string;
  imageUrl: string;
  onProcessed?: (data: ProcessedOCRData) => void;
}

export function RealOCRProcessor({ 
  documentId, 
  clientId, 
  imageUrl, 
  onProcessed 
}: RealOCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedOCRData | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [provider, setProvider] = useState<string>('openai');
  const [showDetails, setShowDetails] = useState(false);

  const processDocument = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Iniciando processamento OCR real...');
      
      const { data, error } = await supabase.functions.invoke('process-real-ocr', {
        body: {
          image_url: imageUrl,
          document_id: documentId,
          client_id: clientId,
          ocr_provider: provider
        }
      });

      if (error) {
        console.error('Erro na função OCR:', error);
        throw new Error(error.message || 'Erro no processamento OCR');
      }

      if (!data.success) {
        throw new Error(data.error || 'Falha no processamento');
      }

      setProcessedData(data.data);
      setConfidence(data.confidence || 0);
      
      toast({
        title: "OCR Real Concluído",
        description: `Documento processado com ${Math.round(data.confidence * 100)}% de confiança`,
      });

      onProcessed?.(data.data);

    } catch (error) {
      console.error('Erro no OCR:', error);
      toast({
        title: "Erro no OCR",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            OCR Real - Extração Avançada
            {confidence > 0 && (
              <Badge variant={confidence > 0.8 ? "default" : "secondary"}>
                {Math.round(confidence * 100)}% confiança
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!processedData ? (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  O OCR real extrairá dados estruturados do documento usando IA avançada.
                  Isso substitui a simulação atual por processamento real.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Processar com OCR Real
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Processamento Concluído</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Ocultar' : 'Ver'} Detalhes
                </Button>
              </div>

              {/* Resumo principal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Tipo</div>
                  <div className="font-medium">{processedData.tipo_documento || 'N/A'}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Número</div>
                  <div className="font-medium">{processedData.numero_documento || 'N/A'}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Data Emissão</div>
                  <div className="font-medium">{formatDate(processedData.data_emissao)}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="font-medium text-green-600">
                    {formatCurrency(processedData.valores?.valor_total)}
                  </div>
                </div>
              </div>

              {/* Detalhes expandidos */}
              {showDetails && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Emissor */}
                    {processedData.emissor && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Emissor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Nome:</span>
                            <div>{processedData.emissor.nome || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">CNPJ:</span>
                            <div>{processedData.emissor.cnpj || 'N/A'}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Valores Fiscais */}
                    {processedData.valores && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Impostos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">ICMS:</span>
                            <span>{formatCurrency(processedData.valores.valor_icms)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">IPI:</span>
                            <span>{formatCurrency(processedData.valores.valor_ipi)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">PIS:</span>
                            <span>{formatCurrency(processedData.valores.valor_pis)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">COFINS:</span>
                            <span>{formatCurrency(processedData.valores.valor_cofins)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Itens */}
                  {processedData.itens && processedData.itens.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Itens ({processedData.itens.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {processedData.itens.slice(0, 3).map((item, index) => (
                            <div key={index} className="border-l-2 border-primary/20 pl-3">
                              <div className="font-medium">{item.descricao}</div>
                              <div className="text-sm text-muted-foreground">
                                Qtd: {item.quantidade} • Unit: {formatCurrency(item.valor_unitario)} • 
                                Total: {formatCurrency(item.valor_total)}
                              </div>
                            </div>
                          ))}
                          {processedData.itens.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              ... e mais {processedData.itens.length - 3} itens
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Observações */}
                  {processedData.observacoes && (
                    <Alert>
                      <AlertDescription>
                        <strong>Observações:</strong> {processedData.observacoes}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}