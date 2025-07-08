import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Brain, AlertTriangle, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AnalisesPreditivas() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState('');
  const [predictionType, setPredictionType] = useState('all');
  const [periodsAhead, setPeriodsAhead] = useState(3);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePredictions = async () => {
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics', {
        body: {
          client_id: selectedClient,
          prediction_type: predictionType,
          periods_ahead: periodsAhead
        }
      });

      if (error) throw error;

      if (data.success) {
        setPredictions(data);
        toast({
          title: "Análise Concluída",
          description: `Previsões geradas para ${periodsAhead} períodos à frente`
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar análises preditivas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend) => {
    return trend === 'growing' || trend === 'increasing' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises Preditivas com IA</h1>
          <p className="text-muted-foreground">
            Previsões inteligentes baseadas em dados históricos e machine learning
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predições Ativas</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictions?.statistical_predictions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Modelos estatísticos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IA Avançada</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictions?.ai_predictions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Análises com GPT</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {predictions?.analysis_summary?.accuracy_metrics?.historical_accuracy ? 
                  `${(predictions.analysis_summary.accuracy_metrics.historical_accuracy * 100).toFixed(0)}%` : 
                  '--'
                }
              </div>
              <p className="text-xs text-muted-foreground">Baseado no histórico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualidade dos Dados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {predictions?.analysis_summary?.accuracy_metrics?.data_quality || '--'}
              </div>
              <p className="text-xs text-muted-foreground">Períodos analisados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurar Análise Preditiva</CardTitle>
            <CardDescription>
              Configure os parâmetros para gerar previsões inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11111111-1111-1111-1111-111111111111">Empresa Teste LTDA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Predição</label>
                <Select value={predictionType} onValueChange={setPredictionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Análise Completa</SelectItem>
                    <SelectItem value="revenue">Apenas Receitas</SelectItem>
                    <SelectItem value="expenses">Apenas Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Períodos à Frente</label>
                <Select value={periodsAhead.toString()} onValueChange={(v) => setPeriodsAhead(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Meses</SelectItem>
                    <SelectItem value="6">6 Meses</SelectItem>
                    <SelectItem value="12">12 Meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGeneratePredictions} disabled={isLoading} className="w-full">
              {isLoading ? 'Gerando Previsões...' : 'Gerar Análise Preditiva'}
            </Button>
          </CardContent>
        </Card>

        {predictions && (
          <Tabs defaultValue="predictions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="predictions">Previsões</TabsTrigger>
              <TabsTrigger value="insights">Insights IA</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {predictions.statistical_predictions?.map((pred, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{pred.type === 'revenue' ? 'Receita' : 'Despesas'} - Período {pred.period}</span>
                        <Badge variant={pred.confidence >= 0.8 ? 'default' : pred.confidence >= 0.6 ? 'secondary' : 'destructive'}>
                          {(pred.confidence * 100).toFixed(0)}% confiança
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(pred.predicted_value)}
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-muted-foreground mb-2">Nível de Confiança</div>
                        <Progress value={pred.confidence * 100} className="h-2" />
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Método: {pred.method}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {predictions.ai_predictions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Previsões Avançadas com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictions.ai_predictions.map((pred, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Período {pred.period}</h4>
                            <Badge>{(pred.confidence * 100).toFixed(0)}% confiança</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Receita Prevista</div>
                              <div className="text-lg font-semibold text-green-600">
                                {formatCurrency(pred.revenue_prediction)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Despesas Previstas</div>
                              <div className="text-lg font-semibold text-red-600">
                                {formatCurrency(pred.expenses_prediction)}
                              </div>
                            </div>
                          </div>
                          {pred.factors && (
                            <div className="text-sm">
                              <div className="font-medium mb-1">Fatores Considerados:</div>
                              <div className="text-muted-foreground">
                                {pred.factors.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {predictions.market_insights && (
                <Card>
                  <CardHeader>
                    <CardTitle>Insights de Mercado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Análise de Tendência</h4>
                      <p className="text-muted-foreground">{predictions.market_insights.trend_analysis}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Potencial de Crescimento</h4>
                      <Badge variant={
                        predictions.market_insights.growth_potential === 'high' ? 'default' :
                        predictions.market_insights.growth_potential === 'medium' ? 'secondary' : 'outline'
                      }>
                        {predictions.market_insights.growth_potential === 'high' ? 'Alto' :
                         predictions.market_insights.growth_potential === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Fatores Sazonais</h4>
                      <p className="text-muted-foreground">{predictions.market_insights.seasonal_factors}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {predictions.data_insights && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Tendências</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Tendência de Receitas</h4>
                          {getTrendIcon(predictions.data_insights.trend_analysis?.revenue_trend)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {predictions.data_insights.trend_analysis?.revenue_trend === 'growing' ? 'Crescente' : 'Declinante'}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Tendência de Despesas</h4>
                          {getTrendIcon(predictions.data_insights.trend_analysis?.expense_trend)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {predictions.data_insights.trend_analysis?.expense_trend === 'increasing' ? 'Aumentando' : 'Diminuindo'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Volatilidade</h4>
                      <div className="text-2xl font-bold">
                        {formatCurrency(predictions.data_insights.volatility?.revenue || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Variação média mensal</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações Estratégicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.market_insights?.recommendations?.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                    {predictions.ai_predictions?.[0]?.recommendations?.map((rec, index) => (
                      <div key={index} className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}