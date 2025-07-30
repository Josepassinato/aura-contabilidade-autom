import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart,
  Calculator,
  Target,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndicadorFinanceiro {
  nome: string;
  valor: number;
  periodo_anterior: number;
  meta?: number;
  unidade: 'percentual' | 'valor' | 'indice';
  categoria: 'liquidez' | 'rentabilidade' | 'endividamento' | 'atividade';
  descricao: string;
}

interface AnaliseComparativa {
  periodo: string;
  receitas: number;
  despesas: number;
  lucro_liquido: number;
  margem_liquida: number;
}

export function AnaliseFinanceira() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [indicadores, setIndicadores] = useState<IndicadorFinanceiro[]>([]);
  const [analiseComparativa, setAnaliseComparativa] = useState<AnaliseComparativa[]>([]);

  useEffect(() => {
    loadDadosFinanceiros();
  }, [selectedPeriod]);

  const loadDadosFinanceiros = async () => {
    try {
      // Em produção, calcular indicadores baseados nos dados contábeis reais
      setIndicadores([]);
      setAnaliseComparativa([]);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (valor: number, unidade: string) => {
    switch (unidade) {
      case 'percentual':
        return `${valor.toFixed(1)}%`;
      case 'valor':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valor);
      case 'indice':
        return valor.toFixed(2);
      default:
        return valor.toString();
    }
  };

  const getVariacao = (atual: number, anterior: number) => {
    const variacao = ((atual - anterior) / anterior) * 100;
    return {
      valor: variacao,
      positiva: variacao > 0,
      texto: `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`
    };
  };

  const getStatusIndicador = (valor: number, meta?: number) => {
    if (!meta) return 'neutral';
    const percentual = (valor / meta) * 100;
    if (percentual >= 95) return 'excelente';
    if (percentual >= 85) return 'bom';
    if (percentual >= 70) return 'atencao';
    return 'critico';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelente':
        return 'text-green-600 bg-green-100';
      case 'bom':
        return 'text-blue-600 bg-blue-100';
      case 'atencao':
        return 'text-yellow-600 bg-yellow-100';
      case 'critico':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excelente':
        return <CheckCircle className="h-4 w-4" />;
      case 'bom':
        return <Target className="h-4 w-4" />;
      case 'atencao':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critico':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'liquidez':
        return <DollarSign className="h-5 w-5" />;
      case 'rentabilidade':
        return <TrendingUp className="h-5 w-5" />;
      case 'endividamento':
        return <BarChart3 className="h-5 w-5" />;
      case 'atividade':
        return <Zap className="h-5 w-5" />;
      default:
        return <Calculator className="h-5 w-5" />;
    }
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando análises financeiras...</p>
        </div>
      </div>
    );
  }

  const indicadoresPorCategoria = indicadores.reduce((acc, indicador) => {
    if (!acc[indicador.categoria]) {
      acc[indicador.categoria] = [];
    }
    acc[indicador.categoria].push(indicador);
    return acc;
  }, {} as Record<string, IndicadorFinanceiro[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise Financeira</h2>
          <p className="text-muted-foreground">
            Indicadores e análises detalhadas da situação financeira
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">Janeiro 2024</SelectItem>
              <SelectItem value="2023-12">Dezembro 2023</SelectItem>
              <SelectItem value="2023-11">Novembro 2023</SelectItem>
              <SelectItem value="2023-10">Outubro 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="indicadores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="comparativo">Análise Comparativa</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="indicadores" className="space-y-4">
          {Object.entries(indicadoresPorCategoria).map(([categoria, indicadoresCategoria]) => (
            <Card key={categoria}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getCategoryIcon(categoria)}
                  Indicadores de {categoria}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {indicadoresCategoria.map((indicador) => {
                    const variacao = getVariacao(indicador.valor, indicador.periodo_anterior);
                    const status = getStatusIndicador(indicador.valor, indicador.meta);
                    
                    return (
                      <div key={indicador.nome} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{indicador.nome}</h3>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            {status}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Atual</p>
                            <p className="text-xl font-bold">
                              {formatValue(indicador.valor, indicador.unidade)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Variação</p>
                            <p className={`text-lg font-semibold flex items-center gap-1 ${
                              variacao.positiva ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {variacao.positiva ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {variacao.texto}
                            </p>
                          </div>
                        </div>

                        {indicador.meta && (
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Meta: {formatValue(indicador.meta, indicador.unidade)}</span>
                              <span>{Math.round((indicador.valor / indicador.meta) * 100)}%</span>
                            </div>
                            <Progress 
                              value={Math.min((indicador.valor / indicador.meta) * 100, 100)} 
                              className="h-2"
                            />
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {indicador.descricao}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="comparativo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Comparativa</CardTitle>
              <CardDescription>
                Comparação dos resultados financeiros entre períodos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analiseComparativa.map((periodo, index) => (
                  <div key={periodo.periodo} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{formatPeriod(periodo.periodo)}</h3>
                      {index === 0 && (
                        <Badge>Período Atual</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Receitas</p>
                        <p className="text-lg font-semibold">
                          {formatValue(periodo.receitas, 'valor')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Despesas</p>
                        <p className="text-lg font-semibold">
                          {formatValue(periodo.despesas, 'valor')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatValue(periodo.lucro_liquido, 'valor')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Margem Líquida</p>
                        <p className="text-lg font-semibold">
                          {formatValue(periodo.margem_liquida, 'percentual')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Evolução dos principais indicadores ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Gráficos de tendências em desenvolvimento.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Visualizações interativas dos indicadores financeiros ao longo do tempo.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico Financeiro</CardTitle>
              <CardDescription>
                Análise automatizada da situação financeira com recomendações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                  <h4 className="font-semibold text-green-800">Pontos Fortes</h4>
                  <ul className="text-sm text-green-700 mt-1">
                    <li>• Liquidez corrente acima de 1,5 indica boa capacidade de pagamento</li>
                    <li>• ROE de 18,2% demonstra boa rentabilidade para os acionistas</li>
                    <li>• Margem líquida em crescimento (12,5% vs 10,8%)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800">Pontos de Atenção</h4>
                  <ul className="text-sm text-yellow-700 mt-1">
                    <li>• Endividamento de 35,5% está acima da meta de 30%</li>
                    <li>• Giro do ativo abaixo da meta (0,92 vs 1,0)</li>
                    <li>• Prazo médio de recebimento ainda elevado (45 dias)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                  <h4 className="font-semibold text-blue-800">Recomendações</h4>
                  <ul className="text-sm text-blue-700 mt-1">
                    <li>• Renegociar prazos de pagamento com fornecedores</li>
                    <li>• Implementar política de cobrança mais efetiva</li>
                    <li>• Avaliar oportunidades de redução de custos operacionais</li>
                    <li>• Considerar otimização da estrutura de capital</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}