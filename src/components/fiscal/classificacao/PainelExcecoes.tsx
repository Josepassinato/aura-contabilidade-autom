
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, AlertTriangle, Sliders, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Lancamento, reclassificarLancamento, obterEstatisticasModelo } from "@/services/fiscal/classificacao/classificacaoML";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface PainelExcecoesProps {
  lancamentosClassificados?: Lancamento[];
  onReclassificar?: (lancamento: Lancamento, novaCategoria: string) => void;
}

export function PainelExcecoes({ 
  lancamentosClassificados = [], 
  onReclassificar 
}: PainelExcecoesProps) {
  const [activeTab, setActiveTab] = useState<string>("baixa-confianca");
  const [filtro, setFiltro] = useState<string>("todos");
  const [thresholdConfianca, setThresholdConfianca] = useState<number>(0.75);
  const [lancamentosFiltrados, setLancamentosFiltrados] = useState<Lancamento[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [categorias, setCategorias] = useState<string[]>([]);

  // Carregar informações do modelo ao inicializar
  useEffect(() => {
    const info = obterEstatisticasModelo();
    setModelInfo(info);
    if (info?.categorias) {
      setCategorias(info.categorias);
    }
  }, []);

  // Atualizar lancamentos filtrados quando mudar o filtro ou tab
  useEffect(() => {
    let filtrados: Lancamento[] = [];
    
    if (activeTab === "baixa-confianca") {
      filtrados = lancamentosClassificados.filter(l => (l.confianca || 0) < thresholdConfianca);
    } else if (activeTab === "pendentes") {
      filtrados = lancamentosClassificados.filter(l => l.status === 'pendente');
    } else if (activeTab === "anomalias") {
      // Simular detecção de anomalias como valores muito altos ou descrições suspeitas
      filtrados = lancamentosClassificados.filter(l => 
        l.valor > 10000 || 
        l.descricao.toLowerCase().includes("suspeito") || 
        l.descricao.toLowerCase().includes("desconhecido")
      );
    }
    
    // Aplicar filtro de tipo
    if (filtro !== "todos") {
      filtrados = filtrados.filter(l => l.tipo === filtro);
    }
    
    setLancamentosFiltrados(filtrados);
  }, [lancamentosClassificados, activeTab, filtro, thresholdConfianca]);

  // Função para reclassificar lançamento
  const handleReclassificar = (lancamento: Lancamento, novaCategoria: string) => {
    const lancamentoAtualizado = reclassificarLancamento(lancamento, novaCategoria);
    
    toast({
      title: "Lançamento reclassificado",
      description: `Classificado como "${novaCategoria}" com confiança máxima.`,
    });
    
    if (onReclassificar) {
      onReclassificar(lancamentoAtualizado, novaCategoria);
    }
  };

  // Renderizar status de confiança
  const renderConfidenceStatus = (confianca?: number) => {
    if (!confianca) return null;
    
    if (confianca >= 0.9) {
      return <Badge className="bg-green-500">Alta ({Math.round(confianca * 100)}%)</Badge>;
    } else if (confianca >= 0.7) {
      return <Badge className="bg-yellow-500">Média ({Math.round(confianca * 100)}%)</Badge>;
    } else {
      return <Badge variant="destructive">Baixa ({Math.round(confianca * 100)}%)</Badge>;
    }
  };

  // Renderizar ícone para o tipo de problema
  const renderStatusIcon = (lancamento: Lancamento) => {
    if (lancamento.status === 'pendente') {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else if ((lancamento.confianca || 0) < thresholdConfianca) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Painel de Exceções</CardTitle>
            <CardDescription>
              Revise e corrija lançamentos com baixa confiança ou que necessitam aprovação manual
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4" />
              <span className="text-sm">Limiar:</span>
              <Select 
                value={thresholdConfianca.toString()} 
                onValueChange={(v) => setThresholdConfianca(parseFloat(v))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">50%</SelectItem>
                  <SelectItem value="0.75">75%</SelectItem>
                  <SelectItem value="0.85">85%</SelectItem>
                  <SelectItem value="0.95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                  <SelectItem value="transferencia">Transferências</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="baixa-confianca">Baixa Confiança</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes de Aprovação</TabsTrigger>
            <TabsTrigger value="anomalias">Anomalias Detectadas</TabsTrigger>
          </TabsList>
          
          {lancamentosClassificados.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>Nenhum lançamento disponível para análise.</p>
              <p className="text-sm mt-2">Classifique lançamentos primeiro para visualizar exceções.</p>
            </div>
          ) : lancamentosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-4 text-green-500 opacity-70" />
              <p>Não há exceções do tipo selecionado.</p>
              <p className="text-sm mt-2">Todos os lançamentos estão dentro dos parâmetros configurados.</p>
            </div>
          ) : (
            <TabsContent value={activeTab} className="space-y-4">
              {activeTab === "baixa-confianca" && (
                <div className="text-sm text-muted-foreground mb-2">
                  Lançamentos classificados com confiança abaixo de {thresholdConfianca * 100}%.
                </div>
              )}
              
              {activeTab === "anomalias" && (
                <div className="text-sm text-muted-foreground mb-2">
                  Lançamentos identificados como potenciais anomalias pelo modelo ML.
                </div>
              )}
              
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor (R$)</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Confiança</TableHead>
                      <TableHead>Classificação Atual</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lancamentosFiltrados.map((lancamento) => (
                      <TableRow key={lancamento.id}>
                        <TableCell>{renderStatusIcon(lancamento)}</TableCell>
                        <TableCell>{lancamento.data}</TableCell>
                        <TableCell className="max-w-xs truncate">{lancamento.descricao}</TableCell>
                        <TableCell>{lancamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <Badge variant={
                            lancamento.tipo === 'receita' ? 'default' : 
                            lancamento.tipo === 'despesa' ? 'destructive' : 'outline'
                          }>
                            {lancamento.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderConfidenceStatus(lancamento.confianca)}</TableCell>
                        <TableCell>{lancamento.categoria || "Não classificado"}</TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(categoria) => handleReclassificar(lancamento, categoria)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Reclassificar" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map(categoria => (
                                <SelectItem key={categoria} value={categoria}>
                                  {categoria}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {modelInfo && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Precisão do modelo:</span>
                    <span className="text-sm">{modelInfo.precisaoEstimada.toFixed(1)}%</span>
                  </div>
                  <Progress value={modelInfo.precisaoEstimada} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    Baseado em {modelInfo.totalExemplos} exemplos de treinamento
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
