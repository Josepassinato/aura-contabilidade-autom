
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnomalyDetector } from "@/components/analytics/AnomalyDetector";
import { PredictiveAnalysis } from "@/components/analytics/PredictiveAnalysis";
import { AccountingAnomaly } from "@/services/analytics/predictiveAnalytics";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, BarChart3, LineChart, FileSpreadsheet } from "lucide-react";

const AnalisesPreditivas = () => {
  const [activeTab, setActiveTab] = useState("anomalias");
  const [selectedAnomaly, setSelectedAnomaly] = useState<AccountingAnomaly | null>(null);
  
  // Simular ID de cliente - em produção viria de uma rota ou contexto
  const clientId = "client-123";
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Análises Preditivas</h1>
            <p className="text-muted-foreground">
              Insights contábeis e financeiros alimentados por inteligência artificial
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="anomalias" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Detecção de Anomalias</span>
            </TabsTrigger>
            <TabsTrigger value="fluxo" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>Previsões Financeiras</span>
            </TabsTrigger>
            <TabsTrigger value="simulacao" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Simulações Tributárias</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="anomalias" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Detecção Inteligente de Anomalias
                  </CardTitle>
                  <CardDescription>
                    Análise baseada em IA para identificar inconsistências contábeis e fiscais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnomalyDetector 
                    clientId={clientId} 
                    onAnomalySelected={(anomaly) => setSelectedAnomaly(anomaly)}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="fluxo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PredictiveAnalysis clientId={clientId} />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Metodologia de Previsão</CardTitle>
                  <CardDescription>Como funcionam nossas análises preditivas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Algoritmos de IA</h3>
                      <p className="text-sm text-muted-foreground">
                        Utilizamos modelos de série temporal (ARIMA, Prophet) e redes neurais recorrentes (LSTM) para fazer previsões baseadas em dados históricos.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Dados Utilizados</h3>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Histórico de faturamento e despesas</li>
                        <li>• Sazonalidade do setor</li>
                        <li>• Indicadores econômicos</li>
                        <li>• Tendências de mercado</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Nível de Confiança</h3>
                      <p className="text-sm text-muted-foreground">
                        Cada previsão inclui um percentual de confiança baseado na qualidade e quantidade de dados disponíveis.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Atualização</h3>
                      <p className="text-sm text-muted-foreground">
                        Previsões são recalculadas diariamente com base em novos dados contábeis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="simulacao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-500" />
                      Otimização de Regime Tributário
                    </CardTitle>
                    <CardDescription>
                      Simulação avançada para identificar o regime mais econômico para seu perfil empresarial
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-6">
                      <PredictiveAnalysis clientId={clientId} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog para detalhes da anomalia */}
      <Dialog open={!!selectedAnomaly} onOpenChange={() => setSelectedAnomaly(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Detalhe da Anomalia
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre a inconsistência detectada
            </DialogDescription>
          </DialogHeader>
          
          {selectedAnomaly && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-lg font-medium">{selectedAnomaly.description}</p>
                <p className="text-sm text-muted-foreground">
                  Detectado em {new Date(selectedAnomaly.date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">R$ {selectedAnomaly.amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nível de Severidade</p>
                  <p className="font-medium">{selectedAnomaly.severityScore}/100</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Recomendações:</p>
                <ul className="space-y-1 text-sm">
                  {selectedAnomaly.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-center italic text-muted-foreground">
                  Esta anomalia foi detectada por algoritmos de machine learning 
                  que analisam padrões históricos e identificam desvios significativos.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AnalisesPreditivas;
