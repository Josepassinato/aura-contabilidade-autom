import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Brain, RefreshCcw, CheckCircle2 } from "lucide-react";
import { 
  classificarLancamentos, 
  treinarModelo, 
  obterEstatisticasModelo,
  reclassificarLancamento,
  Lancamento 
} from "@/services/fiscal/classificacao/classificacaoML";
import { PainelExcecoes } from "./PainelExcecoes";
import { ProcessamentoAvancado } from "./ProcessamentoAvancado";
import { toast } from "@/hooks/use-toast";

// Dados de exemplo para demonstração
const gerarLancamentosExemplo = (): Lancamento[] => {
  const tipos: ('receita' | 'despesa' | 'transferencia')[] = ['receita', 'despesa', 'transferencia'];
  const descricoes = {
    receita: [
      'Pagamento de Cliente XYZ',
      'Venda de mercadorias',
      'Nota Fiscal 1234',
      'Serviço de consultoria',
      'Rendimentos de aplicações',
      'Honorários profissionais'
    ],
    despesa: [
      'Pagamento Fornecedor ABC',
      'Aluguel do escritório',
      'DARF IRPJ',
      'Folha de pagamento',
      'Energia elétrica',
      'Internet corporativa',
      'Material de escritório'
    ],
    transferencia: [
      'Transferência entre contas',
      'TED enviada',
      'PIX para conta poupança'
    ]
  };
  
  const lancamentos: Lancamento[] = [];
  
  // Gera 15 lançamentos aleatórios
  for (let i = 0; i < 15; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const descricoesDisponiveis = descricoes[tipo];
    const descricao = descricoesDisponiveis[Math.floor(Math.random() * descricoesDisponiveis.length)];
    
    lancamentos.push({
      id: `lanc_${i}_${Date.now()}`,
      data: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valor: parseFloat((Math.random() * 10000).toFixed(2)),
      descricao,
      tipo,
      contraparte: tipo === 'receita' ? 'Cliente' : tipo === 'despesa' ? 'Fornecedor' : 'Conta própria',
      status: 'nao_classificado'
    });
  }
  
  return lancamentos;
};

export function ClassificacaoLancamentos() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [classificados, setClassificados] = useState<Lancamento[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState("lancamentos");
  
  // Carrega estatísticas do modelo na inicialização
  useEffect(() => {
    setEstatisticas(obterEstatisticasModelo());
  }, []);
  
  // Carrega lançamentos de exemplo
  const carregarLancamentos = () => {
    setLancamentos(gerarLancamentosExemplo());
    setClassificados([]);
    
    toast({
      title: "Lançamentos carregados",
      description: "Novos lançamentos de exemplo foram gerados para classificação."
    });
  };
  
  // Classifica lançamentos usando o modelo ML
  const executarClassificacao = () => {
    setIsLoading(true);
    
    // Simulação de processamento
    setTimeout(() => {
      const resultado = classificarLancamentos(lancamentos);
      setClassificados(resultado);
      setIsLoading(false);
      
      // Atualiza estatísticas após classificação
      setEstatisticas(obterEstatisticasModelo());
      
      toast({
        title: "Classificação concluída",
        description: `${resultado.length} lançamentos foram classificados pelo modelo.`
      });
    }, 1500);
  };
  
  // Treina o modelo com dados históricos
  const executarTreinamentoModelo = async () => {
    setIsTraining(true);
    
    try {
      await treinarModelo();
      // Atualiza estatísticas após treino
      setEstatisticas(obterEstatisticasModelo());
    } catch (error) {
      console.error("Erro ao treinar modelo:", error);
    } finally {
      setIsTraining(false);
    }
  };
  
  // Reclassifica um lançamento manualmente (simplificado para demonstração)
  const reclassificarItem = (id: string, novaCategoria: string) => {
    setClassificados(prevClassificados => 
      prevClassificados.map(item => 
        item.id === id 
          ? { ...item, categoria: novaCategoria, status: 'classificado', confianca: 1 } 
          : item
      )
    );
    
    toast({
      title: "Lançamento reclassificado",
      description: `O lançamento foi reclassificado manualmente para "${novaCategoria}".`
    });
  };
  
  // Função de reclassificação para o Painel de Exceções
  const handleReclassificacaoExterna = (lancamentoAtualizado: Lancamento, novaCategoria: string) => {
    setClassificados(prevClassificados => 
      prevClassificados.map(item => 
        item.id === lancamentoAtualizado.id ? lancamentoAtualizado : item
      )
    );
    
    toast({
      title: "Lançamento reclassificado",
      description: `O lançamento foi reclassificado para "${novaCategoria}" pelo painel de exceções.`
    });
    
    // Atualiza estatísticas após reclassificação
    setEstatisticas(obterEstatisticasModelo());
  };

  // Tratamento para processamento avançado concluído
  const handleProcessamentoAvancadoCompleto = (resultado: any) => {
    // Atualizar a lista de lançamentos classificados com os resultados do processamento avançado
    setClassificados(resultado.lancamentosProcessados);
    
    // Atualiza estatísticas
    setEstatisticas(obterEstatisticasModelo());
  };
  
  // Tratamento para lançamentos automáticos realizados
  const handleLancamentosRealizados = (sucessos: number, falhas: number) => {
    toast({
      title: "Ciclo contábil completado",
      description: `${sucessos} lançamentos foram processados e registrados automaticamente no sistema contábil.`,
      variant: "default"
    });
    
    // Aqui poderiam ser feitas atualizações adicionais na interface
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Classificação de Lançamentos</CardTitle>
              <CardDescription>
                Motor de regras e ML para classificação automática de lançamentos contábeis
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={carregarLancamentos}
                disabled={isLoading}
              >
                Carregar Lançamentos
              </Button>
              <Button
                variant={lancamentos.length > 0 ? "default" : "outline"}
                onClick={executarClassificacao}
                disabled={lancamentos.length === 0 || isLoading}
              >
                {isLoading ? "Classificando..." : "Classificar"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
              <TabsTrigger value="excecoes">Painel de Exceções</TabsTrigger>
              <TabsTrigger value="avancado">Processamento Avançado</TabsTrigger>
              <TabsTrigger value="modelo">Modelo ML</TabsTrigger>
              <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lancamentos">
              {lancamentos.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhum lançamento disponível</AlertTitle>
                  <AlertDescription>
                    Clique em "Carregar Lançamentos" para gerar dados de exemplo para classificação.
                  </AlertDescription>
                </Alert>
              ) : (
                <div>
                  {isLoading && (
                    <div className="mb-4">
                      <Progress value={45} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Classificando lançamentos usando algoritmos de ML...
                      </p>
                    </div>
                  )}
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 bg-muted p-3 rounded-t-md font-medium text-sm">
                      <div className="col-span-2">Data</div>
                      <div className="col-span-4">Descrição</div>
                      <div className="col-span-2">Valor</div>
                      <div className="col-span-2">Tipo</div>
                      <div className="col-span-2">Status</div>
                    </div>
                    
                    <div className="divide-y">
                      {(classificados.length > 0 ? classificados : lancamentos).map((lancamento) => (
                        <div key={lancamento.id} className="grid grid-cols-12 p-3 hover:bg-muted/50">
                          <div className="col-span-2">{lancamento.data}</div>
                          <div className="col-span-4">{lancamento.descricao}</div>
                          <div className="col-span-2">R$ {lancamento.valor.toFixed(2)}</div>
                          <div className="col-span-2">
                            <Badge variant={
                              lancamento.tipo === 'receita' ? 'default' : 
                              lancamento.tipo === 'despesa' ? 'destructive' : 'outline'
                            }>
                              {lancamento.tipo}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            {lancamento.status === 'classificado' ? (
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{lancamento.categoria}</span>
                              </div>
                            ) : lancamento.status === 'pendente' ? (
                              <Badge variant="outline" className="bg-yellow-50">
                                Revisão pendente
                              </Badge>
                            ) : (
                              <Badge variant="outline">Não classificado</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {classificados.length > 0 && (
                    <div className="mt-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setClassificados([])}>
                        Limpar Classificação
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="excecoes">
              <PainelExcecoes 
                lancamentosClassificados={classificados} 
                onReclassificar={handleReclassificacaoExterna}
              />
            </TabsContent>
            
            <TabsContent value="avancado">
              <ProcessamentoAvancado 
                lancamentos={classificados.length > 0 ? classificados : lancamentos}
                onProcessamentoCompleto={handleProcessamentoAvancadoCompleto}
                onLancamentosRealizados={handleLancamentosRealizados}
              />
            </TabsContent>
            
            <TabsContent value="modelo">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status do Modelo</CardTitle>
                      <CardDescription>Informações sobre o modelo de classificação</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">Status:</dt>
                          <dd>
                            {estatisticas?.modeloTreinado ? (
                              <Badge className="bg-green-600">Treinado</Badge>
                            ) : (
                              <Badge variant="outline">Não treinado</Badge>
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Algoritmo:</dt>
                          <dd>{estatisticas?.tipoModelo || 'Básico'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Versão:</dt>
                          <dd>{estatisticas?.versaoModelo || '1.0'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Total de Exemplos:</dt>
                          <dd>{estatisticas?.totalExemplos || 0}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Precisão Estimada:</dt>
                          <dd>{estatisticas?.precisaoEstimada?.toFixed(1) || 70}%</dd>
                        </div>
                      </dl>
                      
                      <Separator className="my-4" />
                      
                      <Button 
                        onClick={executarTreinamentoModelo} 
                        disabled={isTraining}
                        className="w-full"
                      >
                        {isTraining ? (
                          <>
                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                            Treinando Modelo...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            {estatisticas?.modeloTreinado ? "Retreinar Modelo" : "Treinar Modelo"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Categorias de Classificação</CardTitle>
                      <CardDescription>Categorias utilizadas no modelo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {estatisticas?.categorias?.map((categoria: string) => (
                          <div key={categoria} className="flex items-center justify-between p-2 border rounded-md">
                            <span>{categoria}</span>
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="estatisticas">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Precisão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {estatisticas?.precisaoEstimada?.toFixed(1) || 70}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Baseado em {estatisticas?.totalExemplos || 0} exemplos
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Categorias Suportadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {estatisticas?.categorias?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Categorias definidas no sistema
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Modelo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-medium">
                      {estatisticas?.modeloTreinado ? 'Treinado' : 'Não treinado'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Versão {estatisticas?.versaoModelo || '1.0'}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Simulação de Machine Learning</AlertTitle>
                <AlertDescription>
                  Este é um ambiente de simulação para demonstração do conceito.
                  Em uma implementação real, seria utilizado um modelo scikit-learn ou similar.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
