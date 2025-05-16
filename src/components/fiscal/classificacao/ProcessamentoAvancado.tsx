
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  processarLancamentosAvancados, 
  configurarProcessamentoAvancado,
  realizarLancamentosAutomaticos,
  ResultadoProcessamento,
  ProcessamentoContabilConfig
} from "@/services/fiscal/classificacao/processamentoAvancado";
import { Lancamento } from "@/services/fiscal/classificacao/classificacaoML";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Brain, RefreshCw, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, CircleCheck, CheckCheck } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ProcessamentoAvancadoProps {
  lancamentos?: Lancamento[];
  onProcessamentoCompleto?: (resultado: ResultadoProcessamento) => void;
  onLancamentosRealizados?: (sucessos: number, falhas: number) => void;
}

export function ProcessamentoAvancado({
  lancamentos = [],
  onProcessamentoCompleto,
  onLancamentosRealizados
}: ProcessamentoAvancadoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoProcessamento | null>(null);
  const [config, setConfig] = useState<ProcessamentoContabilConfig>({
    usarIA: true,
    limiarConfiancaAutomatica: 0.85,
    usarContextoHistorico: true,
    validacaoCruzada: true,
    gravarHistoricoDecisoes: true
  });
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [isRealizandoLancamentos, setIsRealizandoLancamentos] = useState(false);

  // Lidar com mudanças na configuração
  const handleConfigChange = (key: keyof ProcessamentoContabilConfig, value: any) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig, [key]: value };
      configurarProcessamentoAvancado(newConfig);
      return newConfig;
    });
  };

  // Iniciar processamento avançado
  const handleIniciarProcessamento = async () => {
    if (!lancamentos.length) {
      toast({
        title: "Nenhum lançamento disponível",
        description: "Carregue lançamentos primeiro para iniciar o processamento.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Configurar processamento com as opções atuais
      configurarProcessamentoAvancado(config);
      
      // Processar lançamentos
      const resultado = await processarLancamentosAvancados(lancamentos);
      setResultado(resultado);
      
      toast({
        title: "Processamento concluído",
        description: `${resultado.sucessos} lançamentos classificados automaticamente, ${resultado.pendencias} pendentes de revisão.`,
      });
      
      if (onProcessamentoCompleto) {
        onProcessamentoCompleto(resultado);
      }
    } catch (error) {
      console.error("Erro no processamento avançado:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro durante o processamento avançado dos lançamentos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Realizar lançamentos automáticos no sistema
  const handleRealizarLancamentos = async () => {
    if (!resultado) {
      toast({
        title: "Nenhum resultado disponível",
        description: "Execute o processamento avançado primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsRealizandoLancamentos(true);
    
    try {
      const { sucessos, falhas } = await realizarLancamentosAutomaticos(resultado.lancamentosProcessados);
      
      toast({
        title: "Lançamentos realizados",
        description: `${sucessos} lançamentos realizados com sucesso, ${falhas} falhas.`,
        variant: sucessos > 0 ? "default" : "destructive"
      });
      
      if (onLancamentosRealizados) {
        onLancamentosRealizados(sucessos, falhas);
      }
    } catch (error) {
      console.error("Erro ao realizar lançamentos:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar os lançamentos automáticos.",
        variant: "destructive"
      });
    } finally {
      setIsRealizandoLancamentos(false);
    }
  };

  // Renderizar indicador de confiança
  const renderConfianca = (confianca: number) => {
    const porcentagem = Math.round(confianca * 100);
    let className = "text-red-500";
    
    if (porcentagem >= 85) {
      className = "text-green-600";
    } else if (porcentagem >= 70) {
      className = "text-yellow-600";
    }
    
    return <span className={className}>{porcentagem}%</span>;
  };

  // Renderizar status da decisão
  const renderDecisao = (decisao: string) => {
    switch (decisao) {
      case 'automatica_alta_confianca':
        return <Badge className="bg-green-600">Automática (Alta Confiança)</Badge>;
      case 'automatica':
        return <Badge className="bg-blue-600">Automática</Badge>;
      case 'pendente_revisao':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendente de Revisão</Badge>;
      default:
        return <Badge variant="outline">{decisao}</Badge>;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Processamento Contábil Avançado
        </CardTitle>
        <CardDescription>
          Automação inteligente do ciclo contábil com IA
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Configuração do Processamento</h3>
            <p className="text-sm text-muted-foreground">
              Defina como a IA processará os lançamentos
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
            className="flex items-center"
          >
            {isAdvancedOptionsOpen ? (
              <>Ocultar opções avançadas <ChevronUp className="ml-2 h-4 w-4" /></>
            ) : (
              <>Opções avançadas <ChevronDown className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>

        {/* Configurações básicas sempre visíveis */}
        <div className="flex items-center space-x-4 py-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="usar-ia" 
              checked={config.usarIA} 
              onCheckedChange={checked => handleConfigChange('usarIA', checked)}
            />
            <Label htmlFor="usar-ia">Usar IA no processamento</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="contexto-historico" 
              checked={config.usarContextoHistorico} 
              onCheckedChange={checked => handleConfigChange('usarContextoHistorico', checked)}
            />
            <Label htmlFor="contexto-historico">Usar contexto histórico</Label>
          </div>
        </div>

        {/* Opções avançadas expansíveis */}
        {isAdvancedOptionsOpen && (
          <div className="p-4 border rounded-md bg-muted/50 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="limiar-confianca">
                  Limiar para classificação automática: {Math.round(config.limiarConfiancaAutomatica * 100)}%
                </Label>
              </div>
              <Slider 
                id="limiar-confianca"
                min={0}
                max={100}
                step={5}
                defaultValue={[config.limiarConfiancaAutomatica * 100]}
                onValueChange={values => handleConfigChange('limiarConfiancaAutomatica', values[0] / 100)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lançamentos com confiança acima deste limiar serão processados automaticamente sem intervenção humana
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="validacao-cruzada" 
                  checked={config.validacaoCruzada} 
                  onCheckedChange={checked => handleConfigChange('validacaoCruzada', checked)}
                />
                <Label htmlFor="validacao-cruzada">Validação cruzada</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="gravar-historico" 
                  checked={config.gravarHistoricoDecisoes} 
                  onCheckedChange={checked => handleConfigChange('gravarHistoricoDecisoes', checked)}
                />
                <Label htmlFor="gravar-historico">Registrar histórico de decisões</Label>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            onClick={handleIniciarProcessamento}
            disabled={isLoading || !lancamentos.length}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando lançamentos...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Iniciar Processamento Avançado
              </>
            )}
          </Button>
        </div>

        {/* Resultado do processamento */}
        {resultado && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Resultados do Processamento</h3>
              <Badge className="px-3 py-1 text-sm">
                {resultado.sucessos} de {resultado.sucessos + resultado.pendencias} classificados automaticamente
              </Badge>
            </div>
            
            <div className="flex justify-between items-center gap-2">
              <div className="text-sm">Processamento em {(resultado.tempoProcessamento / 1000).toFixed(2)}s</div>
              <Progress 
                value={(resultado.sucessos / (resultado.sucessos + resultado.pendencias)) * 100} 
                className="h-2 flex-grow"
              />
              <div className="text-sm font-medium">
                {Math.round((resultado.sucessos / (resultado.sucessos + resultado.pendencias)) * 100)}%
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="decisoes">
                <AccordionTrigger className="font-medium text-sm">
                  Decisões Detalhadas
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead className="hidden md:table-cell">Confiança</TableHead>
                          <TableHead>Decisão</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.logDecisoes.map((decisao, index) => (
                          <TableRow key={decisao.lancamentoId}>
                            <TableCell className="max-w-[200px] truncate">
                              {resultado.lancamentosProcessados[index]?.descricao}
                            </TableCell>
                            <TableCell>
                              R$ {resultado.lancamentosProcessados[index]?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {renderConfianca(decisao.confianca)}
                            </TableCell>
                            <TableCell>
                              {renderDecisao(decisao.decisao)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Botão para realizar lançamentos automáticos */}
            <Button 
              onClick={handleRealizarLancamentos}
              disabled={isRealizandoLancamentos}
              className="w-full mt-4"
              variant="outline"
            >
              {isRealizandoLancamentos ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Realizando lançamentos...
                </>
              ) : (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Realizar Lançamentos Automáticos
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
