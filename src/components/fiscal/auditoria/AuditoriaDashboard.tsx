
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleAlert, CircleX, BarChart3, FileText, RefreshCw, Clock, Activity } from "lucide-react";
import { AuditoriaContinuaConfig } from "./AuditoriaContinuaConfig";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { ProblemaAuditoria, executarAuditoriaCompleta } from "@/services/fiscal/auditoria/auditoriaContinua";
import { toast } from "@/hooks/use-toast";
import { CrossValidationResults } from "./components/CrossValidationResults";
import { performCrossValidation } from "@/services/fiscal/validation/crossValidationService";
import { obterTodasFontesDados } from "@/services/apuracao/fontesDadosService";

export function AuditoriaDashboard() {
  const [clienteId, setClienteId] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resultados, setResultados] = useState<any>(null);
  const [tabAtiva, setTabAtiva] = useState<string>("dashboard");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [loadingValidation, setLoadingValidation] = useState<boolean>(false);

  // Função para executar a auditoria
  const executarAuditoria = async () => {
    if (!clienteId) {
      toast({
        title: "Selecione um cliente",
        description: "É necessário selecionar um cliente para executar a auditoria.",
        variant: "destructive",
      });
      return;
    }

    setCarregando(true);
    try {
      const resultado = await executarAuditoriaCompleta(clienteId);
      setResultados(resultado);
      setUltimaAtualizacao(new Date().toLocaleString());
      
      toast({
        title: "Auditoria completa",
        description: `Auditoria realizada com sucesso. ${resultado.aprovados} lançamentos aprovados.`,
      });
      
      // Run cross-validation if we're on that tab
      if (tabAtiva === "validacao-cruzada") {
        executarValidacaoCruzada();
      }
    } catch (error) {
      console.error("Erro ao executar auditoria:", error);
      toast({
        title: "Erro na auditoria",
        description: "Ocorreu um erro ao processar a auditoria contínua.",
        variant: "destructive",
      });
    } finally {
      setCarregando(false);
    }
  };

  // Executar validação cruzada
  const executarValidacaoCruzada = async () => {
    setLoadingValidation(true);
    try {
      const fontes = obterTodasFontesDados();
      if (fontes.length < 2) {
        toast({
          title: "Fontes insuficientes",
          description: "É necessário configurar pelo menos duas fontes de dados para validação cruzada.",
          variant: "destructive",
        });
        setValidationResults([]);
        return;
      }
      
      const resultados = await performCrossValidation(fontes);
      setValidationResults(resultados);
      
      // Contar discrepâncias de alta gravidade
      const discrepanciasGraves = resultados.reduce((sum, result) => 
        sum + result.discrepancies.filter(d => d.severity === 'high').length, 0);
      
      if (discrepanciasGraves > 0) {
        toast({
          title: "Validação Cruzada Concluída",
          description: `${discrepanciasGraves} discrepâncias graves detectadas entre fontes de dados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Validação Cruzada Concluída",
          description: "Validação cruzada entre fontes de dados finalizada.",
        });
      }
    } catch (error) {
      console.error("Erro ao executar validação cruzada:", error);
      toast({
        title: "Erro na validação",
        description: "Ocorreu um erro ao processar a validação cruzada.",
        variant: "destructive",
      });
    } finally {
      setLoadingValidation(false);
    }
  };

  // Executar auditoria quando o cliente mudar
  useEffect(() => {
    if (clienteId) {
      executarAuditoria();
    }
  }, [clienteId]);

  // Renderizar indicadores de status
  const renderStatus = () => {
    if (!resultados) return null;

    const { totalLancamentos, aprovados, comAtencao, rejeitados } = resultados;
    const percentAprovados = (aprovados / totalLancamentos) * 100;
    const percentAtencao = (comAtencao / totalLancamentos) * 100;
    const percentRejeitados = (rejeitados / totalLancamentos) * 100;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Aprovados</div>
                <div className="text-2xl font-bold">{aprovados} / {totalLancamentos}</div>
                <div className="text-xs text-muted-foreground mt-1">{percentAprovados.toFixed(1)}% dos lançamentos</div>
              </div>
              <CircleCheck className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={percentAprovados} className="mt-3 bg-green-200" />
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Atenção</div>
                <div className="text-2xl font-bold">{comAtencao} / {totalLancamentos}</div>
                <div className="text-xs text-muted-foreground mt-1">{percentAtencao.toFixed(1)}% dos lançamentos</div>
              </div>
              <CircleAlert className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={percentAtencao} className="mt-3 bg-yellow-200" />
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Rejeitados</div>
                <div className="text-2xl font-bold">{rejeitados} / {totalLancamentos}</div>
                <div className="text-xs text-muted-foreground mt-1">{percentRejeitados.toFixed(1)}% dos lançamentos</div>
              </div>
              <CircleX className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={percentRejeitados} className="mt-3 bg-red-200" />
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar problemas mais comuns
  const renderProblemasMaisComuns = () => {
    if (!resultados || !resultados.problemasMaisComuns) return null;

    const { problemasMaisComuns } = resultados;
    
    const traduzirTipoProblema = (tipo: string): string => {
      const traducoes: Record<string, string> = {
        'classificacao': 'Classificação Contábil',
        'valor': 'Valor Incorreto',
        'data': 'Data Inválida',
        'documento': 'Documentação Incompleta',
        'duplicidade': 'Possível Duplicidade',
        'tributario': 'Questão Tributária',
        'outro': 'Outros Problemas'
      };
      
      return traducoes[tipo] || tipo;
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problemas Mais Comuns</CardTitle>
          <CardDescription>
            Principais inconsistências detectadas pelo sistema de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {problemasMaisComuns.map((problema: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={index < 2 ? "destructive" : index < 3 ? "default" : "outline"}>
                    {problema.contagem}
                  </Badge>
                  <span>{traduzirTipoProblema(problema.tipo)}</span>
                </div>
                <Progress 
                  value={(problema.contagem / problemasMaisComuns[0].contagem) * 100} 
                  className="w-24"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Auditoria Contínua</h2>
        <ClientSelector
          onClientChange={(cliente) => setClienteId(cliente.id)}
        />
      </div>

      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="validacao-cruzada" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Validação Cruzada
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Configuração
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="pt-4 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Dashboard de Auditoria</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {ultimaAtualizacao && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Última atualização: {ultimaAtualizacao}</span>
                    </>
                  )}
                </div>
              </div>
              <CardDescription>
                Visão geral dos resultados da auditoria contínua com IA
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!clienteId ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-1">Selecione um cliente</h3>
                  <p>Escolha um cliente no seletor acima para visualizar os dados de auditoria.</p>
                </div>
              ) : carregando ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-10 w-10 mx-auto mb-4 animate-spin text-primary opacity-70" />
                  <p className="text-muted-foreground">Processando auditoria contínua...</p>
                </div>
              ) : !resultados ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-1">Sem dados disponíveis</h3>
                  <p>Não há resultados de auditoria para exibir no momento.</p>
                </div>
              ) : (
                <>
                  {renderStatus()}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderProblemasMaisComuns()}
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Análise de Risco</CardTitle>
                        <CardDescription>
                          Avaliação de riscos financeiros e tributários
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Risco Tributário</span>
                              <span className="text-xs font-medium">{resultados.rejeitados > 3 ? 'Alto' : 'Médio'}</span>
                            </div>
                            <Progress
                              value={resultados.rejeitados > 5 ? 80 : resultados.rejeitados > 2 ? 50 : 20}
                              className={resultados.rejeitados > 3 ? "bg-red-100" : "bg-yellow-100"}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Risco de Conformidade</span>
                              <span className="text-xs font-medium">
                                {resultados.comAtencao > 8 ? 'Alto' : resultados.comAtencao > 4 ? 'Médio' : 'Baixo'}
                              </span>
                            </div>
                            <Progress
                              value={resultados.comAtencao > 8 ? 75 : resultados.comAtencao > 4 ? 45 : 15}
                              className={resultados.comAtencao > 8 ? "bg-red-100" : resultados.comAtencao > 4 ? "bg-yellow-100" : "bg-green-100"}
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Qualidade dos Dados</span>
                              <span className="text-xs font-medium">
                                {resultados.aprovados / resultados.totalLancamentos > 0.8 ? 'Alta' : 'Média'}
                              </span>
                            </div>
                            <Progress
                              value={(resultados.aprovados / resultados.totalLancamentos) * 100}
                              className={(resultados.aprovados / resultados.totalLancamentos) > 0.8 ? "bg-green-100" : "bg-yellow-100"}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                onClick={executarAuditoria}
                disabled={!clienteId || carregando}
                className="flex items-center space-x-2"
              >
                {carregando ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>{carregando ? "Processando..." : "Executar Auditoria"}</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="validacao-cruzada" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Validação Cruzada entre Fontes</CardTitle>
                  <CardDescription>
                    Verificação de consistência de dados entre diferentes fontes
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {ultimaAtualizacao && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Última atualização: {ultimaAtualizacao}</span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {!clienteId ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-1">Selecione um cliente</h3>
                  <p>Escolha um cliente no seletor acima para realizar validação cruzada.</p>
                </div>
              ) : (
                <CrossValidationResults 
                  results={validationResults}
                  isLoading={loadingValidation}
                />
              )}
            </CardContent>

            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                onClick={executarValidacaoCruzada}
                disabled={!clienteId || loadingValidation}
                className="flex items-center space-x-2"
              >
                {loadingValidation ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                <span>
                  {loadingValidation ? "Processando..." : "Executar Validação Cruzada"}
                </span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="configuracao" className="pt-4">
          <AuditoriaContinuaConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
