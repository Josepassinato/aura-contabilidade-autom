
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowPrediction, TaxOptimizationPrediction, PredictiveAnalyticsService } from "@/services/analytics/predictiveAnalytics";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";

interface PredictiveAnalysisProps {
  clientId: string;
}

export function PredictiveAnalysis({ clientId }: PredictiveAnalysisProps) {
  const [cashFlowData, setCashFlowData] = useState<CashFlowPrediction | null>(null);
  const [taxData, setTaxData] = useState<TaxOptimizationPrediction | null>(null);
  const [loading, setLoading] = useState({
    cashFlow: false,
    tax: false
  });
  const [activeTab, setActiveTab] = useState("cashflow");

  // Carregar dados ao inicializar
  useEffect(() => {
    if (clientId && activeTab === "cashflow" && !cashFlowData) {
      loadCashFlowData();
    }
    if (clientId && activeTab === "tax" && !taxData) {
      loadTaxData();
    }
  }, [clientId, activeTab]);

  // Carregar previsão de fluxo de caixa
  const loadCashFlowData = async () => {
    setLoading(prev => ({ ...prev, cashFlow: true }));
    try {
      const data = await PredictiveAnalyticsService.generateCashFlowPrediction(clientId);
      setCashFlowData(data);
    } catch (error) {
      logger.error("Erro ao carregar previsão de fluxo de caixa", error, "PredictiveAnalysis");
    } finally {
      setLoading(prev => ({ ...prev, cashFlow: false }));
    }
  };

  // Carregar análise tributária
  const loadTaxData = async () => {
    setLoading(prev => ({ ...prev, tax: true }));
    try {
      const data = await PredictiveAnalyticsService.analyzeTaxRegimes(clientId);
      setTaxData(data);
    } catch (error) {
      logger.error("Erro ao carregar análise tributária", error, "PredictiveAnalysis");
    } finally {
      setLoading(prev => ({ ...prev, tax: false }));
    }
  };

  // Formatar dados para o gráfico de fluxo de caixa
  const formatCashFlowChartData = () => {
    if (!cashFlowData) return [];

    return [
      {
        name: '1 mês',
        entrada: cashFlowData.cashInflow.months1,
        saída: cashFlowData.cashOutflow.months1,
        líquido: cashFlowData.netCashFlow.months1
      },
      {
        name: '3 meses',
        entrada: cashFlowData.cashInflow.months3,
        saída: cashFlowData.cashOutflow.months3,
        líquido: cashFlowData.netCashFlow.months3
      },
      {
        name: '6 meses',
        entrada: cashFlowData.cashInflow.months6,
        saída: cashFlowData.cashOutflow.months6,
        líquido: cashFlowData.netCashFlow.months6
      },
      {
        name: '12 meses',
        entrada: cashFlowData.cashInflow.months12,
        saída: cashFlowData.cashOutflow.months12,
        líquido: cashFlowData.netCashFlow.months12
      }
    ];
  };

  // Formatar dados para o gráfico de comparação tributária
  const formatTaxComparisonData = () => {
    if (!taxData) return [];

    return [
      {
        name: 'Regime Atual',
        valor: taxData.currentRegime.annualTax,
      },
      {
        name: 'Regime Recomendado',
        valor: taxData.recommendedRegime.annualTax,
      }
    ];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análises Preditivas</CardTitle>
        <CardDescription>
          Projeções financeiras e tributárias baseadas em IA
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="tax">Otimização Tributária</TabsTrigger>
          </TabsList>

          <TabsContent value="cashflow" className="space-y-4">
            {loading.cashFlow ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Gerando previsão de fluxo de caixa...</p>
                </div>
              </div>
            ) : cashFlowData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Tendência</p>
                    <div className="flex items-center mt-1">
                      {cashFlowData.trend === "increasing" ? (
                        <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
                      ) : cashFlowData.trend === "decreasing" ? (
                        <ArrowDownRight className="h-5 w-5 text-red-500 mr-2" />
                      ) : (
                        <span className="h-5 w-5 mr-2">→</span>
                      )}
                      <span className="font-medium capitalize">
                        {cashFlowData.trend === "increasing" ? "Crescente" : 
                         cashFlowData.trend === "decreasing" ? "Decrescente" : "Estável"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Confiança</p>
                    <div className="flex items-center mt-1">
                      <span className="font-medium">{Math.round(cashFlowData.confidence * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Fluxo Líquido (12 meses)</p>
                    <div className="flex items-center mt-1">
                      <span className="font-medium">
                        R$ {cashFlowData.netCashFlow.months12.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatCashFlowChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, undefined]} />
                      <Legend />
                      <Line type="monotone" dataKey="entrada" stroke="#22c55e" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="saída" stroke="#ef4444" />
                      <Line type="monotone" dataKey="líquido" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Fatores Sazonais</h4>
                  <ul className="space-y-1 text-sm">
                    {cashFlowData.seasonalFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="mt-4 text-muted-foreground">
                    Dados de previsão não disponíveis
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            {loading.tax ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Analisando regimes tributários...</p>
                </div>
              </div>
            ) : taxData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg col-span-2">
                    <p className="text-sm text-muted-foreground">Regime Recomendado</p>
                    <div className="flex items-center mt-1">
                      <span className="font-medium text-lg">{taxData.recommendedRegime.name}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-muted-foreground">Economia Anual</p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {taxData.recommendedRegime.savingsPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatTaxComparisonData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, undefined]} />
                      <Bar dataKey="valor" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Considerações</h4>
                  <ul className="space-y-1 text-sm">
                    {taxData.considerations.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="mt-4 text-muted-foreground">
                    Dados de otimização tributária não disponíveis
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
