import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Sparkles, AlertCircle, Check, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ResultadoReconciliacao } from "@/services/fiscal/reconciliacao/reconciliacaoBancaria";
import { 
  resolverDiscrepanciasAutomaticamente, 
  ConfiguracaoResolucao, 
  configPadraoResolucao,
  ResultadoResolucaoAutonoma
} from "@/services/fiscal/reconciliacao/resolucaoAutonoma";

interface ResolucaoAutonomaProps {
  resultadoReconciliacao: ResultadoReconciliacao | null;
  onResultadoResolvido?: (resultado: ResultadoReconciliacao) => void;
  isLoading?: boolean;
}

export function ResolucaoAutonoma({ 
  resultadoReconciliacao,
  onResultadoResolvido,
  isLoading = false
}: ResolucaoAutonomaProps) {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoResolucao>({...configPadraoResolucao});
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoResolucaoAutonoma | null>(null);
  
  const totalPendentes = resultadoReconciliacao ? (
    resultadoReconciliacao.transacoesNaoConciliadas.length + 
    resultadoReconciliacao.lancamentosNaoConciliados.length
  ) : 0;
  
  const handleResolverAutomaticamente = async () => {
    if (!resultadoReconciliacao) {
      toast({
        title: "Erro",
        description: "É necessário realizar a reconciliação antes de resolver discrepâncias.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessando(true);
    
    try {
      const resultadoResolucao = await resolverDiscrepanciasAutomaticamente(
        resultadoReconciliacao,
        configuracao
      );
      
      setResultado(resultadoResolucao);
      
      if (onResultadoResolvido) {
        onResultadoResolvido(resultadoResolucao.reconciliacaoAtualizada);
      }
      
      toast({
        title: "Resolução automática concluída",
        description: `${resultadoResolucao.totalResolucoes} discrepâncias resolvidas com sucesso.`
      });
    } catch (error) {
      console.error("Erro na resolução automática:", error);
      toast({
        title: "Erro na resolução automática",
        description: "Ocorreu um erro ao tentar resolver as discrepâncias automaticamente.",
        variant: "destructive"
      });
    } finally {
      setProcessando(false);
    }
  };
  
  const toggleConfiguracao = () => {
    setMostrarConfig(!mostrarConfig);
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
              Resolução Autônoma
            </CardTitle>
            <CardDescription>
              Resolução inteligente de discrepâncias com IA e regras avançadas
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleConfiguracao}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {mostrarConfig ? (
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Configurações de Resolução Autônoma</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="resolverDuplicados">Resolver lançamentos duplicados</Label>
                <Switch 
                  id="resolverDuplicados"
                  checked={configuracao.resolverLancamentosDuplicados}
                  onCheckedChange={(checked) => setConfiguracao({
                    ...configuracao,
                    resolverLancamentosDuplicados: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="corrigirDivergencias">Corrigir divergências de valor</Label>
                <Switch 
                  id="corrigirDivergencias"
                  checked={configuracao.corrigirDivergenciasValor}
                  onCheckedChange={(checked) => setConfiguracao({
                    ...configuracao,
                    corrigirDivergenciasValor: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="criarLancamentos">Criar lançamentos para transações não conciliadas</Label>
                <Switch 
                  id="criarLancamentos"
                  checked={configuracao.criarLancamentosParaTransacoesNaoConciliadas}
                  onCheckedChange={(checked) => setConfiguracao({
                    ...configuracao,
                    criarLancamentosParaTransacoesNaoConciliadas: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ignorarInternas">Ignorar transações internas</Label>
                <Switch 
                  id="ignorarInternas"
                  checked={configuracao.ignorarTransacoesInternas}
                  onCheckedChange={(checked) => setConfiguracao({
                    ...configuracao,
                    ignorarTransacoesInternas: checked
                  })}
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="tolerancia">Tolerância de divergência (%)</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider 
                      id="tolerancia"
                      min={0} 
                      max={10} 
                      step={0.5}
                      value={[configuracao.toleranciaDivergencia * 100]}
                      onValueChange={(value) => setConfiguracao({
                        ...configuracao,
                        toleranciaDivergencia: value[0] / 100
                      })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{(configuracao.toleranciaDivergencia * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confiancaMinima">Confiança mínima para resolução</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider 
                      id="confiancaMinima"
                      min={50} 
                      max={100} 
                      step={1}
                      value={[configuracao.minimumConfidenceToResolve * 100]}
                      onValueChange={(value) => setConfiguracao({
                        ...configuracao,
                        minimumConfidenceToResolve: value[0] / 100
                      })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{Math.round(configuracao.minimumConfidenceToResolve * 100)}%</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="diasRetroativos">Máximo de dias retroativos</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="diasRetroativos"
                      type="number"
                      min={1}
                      max={365}
                      value={configuracao.maxDiasRetroativos}
                      onChange={(e) => setConfiguracao({
                        ...configuracao,
                        maxDiasRetroativos: parseInt(e.target.value) || 90
                      })}
                      className="w-20"
                    />
                    <Label className="flex-1">dias</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setConfiguracao({...configPadraoResolucao})}
                >
                  Restaurar Padrões
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => setMostrarConfig(false)}
                >
                  Aplicar Configurações
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!resultadoReconciliacao ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Reconciliação necessária</AlertTitle>
                <AlertDescription>
                  Realize a reconciliação bancária primeiro para habilitar a resolução autônoma.
                </AlertDescription>
              </Alert>
            ) : totalPendentes === 0 ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Tudo conciliado</AlertTitle>
                <AlertDescription>
                  Todas as transações foram reconciliadas com sucesso.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Itens pendentes de reconciliação</h3>
                    <p className="text-sm text-muted-foreground">
                      {resultadoReconciliacao.transacoesNaoConciliadas.length} transações e{' '}
                      {resultadoReconciliacao.lancamentosNaoConciliados.length} lançamentos não reconciliados
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    {totalPendentes} pendentes
                  </Badge>
                </div>

                <Button
                  className="w-full"
                  onClick={handleResolverAutomaticamente}
                  disabled={isLoading || processando || totalPendentes === 0}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {processando ? "Processando..." : "Resolver Automaticamente"}
                </Button>
                
                {resultado && (
                  <div className="mt-4 space-y-2 bg-muted/50 p-3 rounded-md">
                    <h4 className="font-medium text-sm">Resultados da resolução</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-muted-foreground">Duplicações resolvidas</div>
                        <div className="text-lg font-medium">{resultado.duplicacoesResolvidas}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-muted-foreground">Divergências corrigidas</div>
                        <div className="text-lg font-medium">{resultado.divergenciasCorrigidas}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-muted-foreground">Lançamentos criados</div>
                        <div className="text-lg font-medium">{resultado.lancamentosCriados.length}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-muted-foreground">Transações ignoradas</div>
                        <div className="text-lg font-medium">{resultado.transacoesIgnoradas.length}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
