
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AccountingAnomaly, PredictiveAnalyticsService } from "@/services/analytics/predictiveAnalytics";
import { AlertTriangle, FileCheck, AlertCircle, RefreshCw } from "lucide-react";

interface AnomalyDetectorProps {
  clientId: string;
  onAnomalySelected?: (anomaly: AccountingAnomaly) => void;
}

export function AnomalyDetector({ clientId, onAnomalySelected }: AnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useState<AccountingAnomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Carregar anomalias ao inicializar
  useEffect(() => {
    if (clientId) {
      detectAnomalies();
    }
  }, [clientId]);

  // Função para detectar anomalias
  const detectAnomalies = async () => {
    setLoading(true);
    try {
      const result = await PredictiveAnalyticsService.detectAnomalies(clientId);
      setAnomalies(result);
      setLastUpdated(new Date());
    } catch (error) {
      logger.error("Erro ao detectar anomalias contábeis", error, "AnomalyDetector");
    } finally {
      setLoading(false);
    }
  };

  // Formatar severidade em texto
  const getSeverityLevel = (score: number): { text: string; color: string } => {
    if (score >= 80) return { text: "Crítica", color: "bg-destructive text-destructive-foreground" };
    if (score >= 60) return { text: "Alta", color: "bg-orange-500 text-white" };
    if (score >= 40) return { text: "Média", color: "bg-yellow-500 text-white" };
    return { text: "Baixa", color: "bg-blue-500 text-white" };
  };

  // Ícone para cada tipo de anomalia
  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "revenue":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <FileCheck className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Detector de Anomalias</CardTitle>
            <CardDescription>
              Análise automática de inconsistências contábeis e fiscais
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={detectAnomalies} 
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="text-center text-sm text-muted-foreground">
              Analisando dados contábeis com algoritmos de IA...
            </div>
            <Progress value={45} className="h-2 w-full" />
          </div>
        ) : anomalies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma anomalia detectada para este cliente.
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly) => {
              const severity = getSeverityLevel(anomaly.severityScore);
              
              return (
                <div 
                  key={anomaly.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onAnomalySelected?.(anomaly)}
                >
                  <div className="flex items-start gap-3">
                    {getAnomalyIcon(anomaly.type)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{anomaly.description}</h4>
                        <Badge className={severity.color}>{severity.text}</Badge>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {new Date(anomaly.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          R$ {anomaly.amount.toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        {lastUpdated && (
          <div className="w-full flex justify-between items-center">
            <span>Última análise: {lastUpdated.toLocaleString()}</span>
            <span>Powered by IA Contábil Avançada</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
