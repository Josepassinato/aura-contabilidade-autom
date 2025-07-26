import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Brain, TrendingUp, CheckCircle, RefreshCw, Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ErrorPattern {
  id: string;
  type: string;
  description: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_systems: string[];
  root_cause: string;
  suggested_fix: string;
  auto_fix_available: boolean;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface AnalysisResult {
  total_errors: number;
  patterns: ErrorPattern[];
  recommendations: string[];
  automation_opportunities: string[];
  confidence_score: number;
}

export function AIErrorAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar última análise se existir
    loadLastAnalysis();
  }, []);

  const loadLastAnalysis = async () => {
    try {
      // Por enquanto, usar localStorage para armazenar a última análise
      const lastAnalysisData = localStorage.getItem('last_ai_error_analysis');
      if (lastAnalysisData) {
        const data = JSON.parse(lastAnalysisData);
        setAnalysisResult(data.analysis_result);
        setLastAnalysis(new Date(data.timestamp));
      }
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Simular progresso da análise
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke('analyze-errors-ai', {
        body: {
          analysis_type: 'comprehensive',
          timeframe: '30_days'
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      const result: AnalysisResult = data.analysis;
      setAnalysisResult(result);
      setLastAnalysis(new Date());

      // Salvar resultado da análise no localStorage
      localStorage.setItem('last_ai_error_analysis', JSON.stringify({
        analysis_result: result,
        confidence_score: result.confidence_score,
        timestamp: new Date().toISOString()
      }));

      toast({
        title: "Análise concluída",
        description: `${result.patterns.length} padrões de erro identificados com ${(result.confidence_score * 100).toFixed(0)}% de confiança.`,
      });
      
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível completar a análise de erros.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const applyAutoFix = async (patternId: string) => {
    try {
      const { error } = await supabase.functions.invoke('apply-auto-fix', {
        body: { pattern_id: patternId }
      });

      if (error) throw error;

      toast({
        title: "Correção aplicada",
        description: "A correção automática foi aplicada com sucesso.",
      });

      // Recarregar análise
      runAnalysis();
    } catch (error) {
      toast({
        title: "Erro na correção",
        description: "Não foi possível aplicar a correção automática.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Analisador IA de Erros
          </CardTitle>
          <CardDescription>
            Use inteligência artificial para identificar padrões de erros e sugerir correções automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {lastAnalysis && (
                <p className="text-sm text-muted-foreground">
                  Última análise: {lastAnalysis.toLocaleDateString()} às {lastAnalysis.toLocaleTimeString()}
                </p>
              )}
              {analysisResult && (
                <p className="text-sm text-muted-foreground">
                  {analysisResult.total_errors} erros analisados • {analysisResult.patterns.length} padrões identificados
                </p>
              )}
            </div>
            <Button 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {analysisResult ? 'Atualizar Análise' : 'Iniciar Análise'}
                </>
              )}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Analisando padrões de erro... {Math.round(progress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          {/* Resumo da Análise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{analysisResult.total_errors}</p>
                    <p className="text-sm text-muted-foreground">Erros Analisados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{analysisResult.patterns.length}</p>
                    <p className="text-sm text-muted-foreground">Padrões Identificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {analysisResult.patterns.filter(p => p.auto_fix_available).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Correções Automáticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Padrões de Erro */}
          <Card>
            <CardHeader>
              <CardTitle>Padrões de Erro Identificados</CardTitle>
              <CardDescription>
                Padrões recorrentes detectados pela análise de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.patterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{pattern.type}</h4>
                          <Badge className={getSeverityColor(pattern.severity)}>
                            {pattern.severity.toUpperCase()}
                          </Badge>
                          {getTrendIcon(pattern.trend)}
                        </div>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{pattern.frequency}x</p>
                        <p className="text-xs text-muted-foreground">ocorrências</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Causa raiz:</p>
                        <p className="text-sm text-muted-foreground">{pattern.root_cause}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Correção sugerida:</p>
                        <p className="text-sm text-muted-foreground">{pattern.suggested_fix}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {pattern.affected_systems.map((system, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>

                      {pattern.auto_fix_available && (
                        <Button 
                          size="sm" 
                          onClick={() => applyAutoFix(pattern.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Aplicar Correção Automática
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          {analysisResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recomendações da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Oportunidades de Automação */}
          {analysisResult.automation_opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Oportunidades de Automação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.automation_opportunities.map((opp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span className="text-sm">{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}