
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccountingAnomaly, PredictiveAnalyticsService } from "@/services/analytics/predictiveAnalytics";
import { AnomalyDetector } from "@/components/analytics/AnomalyDetector";
import { toast } from "@/hooks/use-toast";

interface AnomaliasPainelProps {
  clientId: string;
  onInspect?: (anomalia: AccountingAnomaly) => void;
}

export function AnomaliasPainel({ clientId, onInspect }: AnomaliasPainelProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AccountingAnomaly | null>(null);
  const [relatedData, setRelatedData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para lidar com seleção de anomalia
  const handleAnomalySelected = async (anomaly: AccountingAnomaly) => {
    setSelectedAnomaly(anomaly);
    setIsLoading(true);
    
    try {
      // Buscar dados relacionados à anomalia
      const related = await PredictiveAnalyticsService.getRelatedTransactions(anomaly.id);
      setRelatedData(related);
    } catch (error) {
      console.error("Erro ao buscar dados relacionados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados relacionados a esta anomalia.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
    
    if (onInspect) {
      onInspect(anomaly);
    }
  };

  // Função para corrigir anomalia
  const handleCorrigirAnomalia = () => {
    if (!selectedAnomaly) return;
    
    toast({
      title: "Anomalia corrigida",
      description: `A anomalia "${selectedAnomaly.description}" foi marcada como resolvida.`,
    });
    
    setSelectedAnomaly(null);
    setRelatedData(null);
  };
  
  // Função para ignorar anomalia
  const handleIgnorarAnomalia = () => {
    if (!selectedAnomaly) return;
    
    toast({
      title: "Anomalia ignorada",
      description: `A anomalia "${selectedAnomaly.description}" foi ignorada.`,
    });
    
    setSelectedAnomaly(null);
    setRelatedData(null);
  };

  // Formatar severidade em texto
  const getSeverityLevel = (score: number): { text: string; color: string } => {
    if (score >= 80) return { text: "Crítica", color: "bg-destructive text-destructive-foreground" };
    if (score >= 60) return { text: "Alta", color: "bg-orange-500 text-white" };
    if (score >= 40) return { text: "Média", color: "bg-yellow-500 text-white" };
    return { text: "Baixa", color: "bg-blue-500 text-white" };
  };

  // Função para solicitar processamento automático da anomalia
  const handleProcessarAutomaticamente = async () => {
    if (!selectedAnomaly) return;
    
    setIsLoading(true);
    
    try {
      // Usar a nova função de análise para automação
      const analise = await PredictiveAnalyticsService.analyzeTransactionForAutomation(
        {
          id: selectedAnomaly.id,
          description: selectedAnomaly.description,
          amount: selectedAnomaly.amount,
          date: selectedAnomaly.date,
          type: selectedAnomaly.type
        },
        clientId
      );
      
      if (analise.requiresHumanReview) {
        toast({
          title: "Revisão manual necessária",
          description: `Confiança insuficiente (${Math.round(analise.automationConfidence * 100)}%) para processamento automático.`,
          variant: "default" // Alterado de "warning" para "default"
        });
      } else {
        toast({
          title: "Processado automaticamente",
          description: `Anomalia processada com ${Math.round(analise.automationConfidence * 100)}% de confiança.`,
        });
        
        setSelectedAnomaly(null);
        setRelatedData(null);
      }
    } catch (error) {
      console.error("Erro ao processar anomalia:", error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar automaticamente esta anomalia.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        {clientId && clientId !== 'overview' ? (
          <AnomalyDetector
            clientId={clientId} 
            onAnomalySelected={handleAnomalySelected} 
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Detector de Anomalias</CardTitle>
              <CardDescription>
                Análise automática de inconsistências contábeis e fiscais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mb-4 opacity-30 mx-auto" />
                <p>Selecione um cliente para detectar anomalias contábeis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Anomalia</CardTitle>
          <CardDescription>
            Informações detalhadas e ações corretivas
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!selectedAnomaly ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-4 opacity-30" />
              <p>Selecione uma anomalia no painel ao lado para visualizar seus detalhes</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-medium">{selectedAnomaly.description}</h3>
                  {selectedAnomaly.severityScore && (
                    <Badge className={getSeverityLevel(selectedAnomaly.severityScore).color}>
                      {getSeverityLevel(selectedAnomaly.severityScore).text}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium">{new Date(selectedAnomaly.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="font-medium">R$ {selectedAnomaly.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">{selectedAnomaly.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Confiança de detecção</p>
                    <p className="font-medium">{selectedAnomaly.detectionConfidence ? `${(selectedAnomaly.detectionConfidence * 100).toFixed(0)}%` : "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium">Detalhes adicionais:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnomaly.details || "Sem detalhes adicionais."}
                  </p>
                </div>
                
                <Tabs defaultValue="dados">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="dados">Dados Relacionados</TabsTrigger>
                    <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dados" className="pt-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !relatedData || relatedData.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum dado relacionado disponível
                      </div>
                    ) : (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {relatedData.map((item, index) => (
                            <div key={index} className="p-2 border rounded-md flex items-center justify-between">
                              <div>
                                <div className="font-medium">{item.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString()} • R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="recomendacoes" className="pt-4">
                    <div className="space-y-2">
                      <p className="font-medium">Ações recomendadas:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedAnomaly.recommendations && selectedAnomaly.recommendations.length > 0 ? (
                          selectedAnomaly.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))
                        ) : (
                          <>
                            <li>Verificar a documentação relacionada a este lançamento.</li>
                            <li>Confirmar a autenticidade da transação com a contraparte.</li>
                            <li>Revisar a classificação contábil e fiscal.</li>
                            <li>Documentar a resolução para futuro treinamento do modelo.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </CardContent>
        
        {selectedAnomaly && (
          <CardFooter className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleIgnorarAnomalia}>
                Ignorar
              </Button>
              <Button variant="outline" onClick={handleProcessarAutomaticamente} disabled={isLoading}>
                {isLoading ? "Processando..." : "Processar Automaticamente"}
              </Button>
            </div>
            <Button onClick={handleCorrigirAnomalia}>
              Marcar como Corrigida
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
