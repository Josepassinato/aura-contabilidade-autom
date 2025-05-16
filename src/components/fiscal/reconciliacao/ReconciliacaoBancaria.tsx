import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertCircle,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  FileCheck,
  X,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Lancamento } from "@/services/fiscal/classificacao/classificacaoML";
import { 
  reconciliarTransacoes, 
  desfazerReconciliacao,
  ReconciliacaoItem,
  ResultadoReconciliacao
} from "@/services/fiscal/reconciliacao/reconciliacaoBancaria";
import { 
  obterExtratoBancario, 
  TransacaoBancaria 
} from "@/services/bancario/openBankingService";
import { simularFluxoProcessamento } from "@/services/fiscal/mensageria/eventoProcessor";
import { ResolucaoAutonoma } from "./ResolucaoAutonoma";

export function ReconciliacaoBancaria() {
  const [bancoSelecionado, setBancoSelecionado] = useState("Itaú");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [transacoes, setTransacoes] = useState<TransacaoBancaria[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [resultadoReconciliacao, setResultadoReconciliacao] = useState<ResultadoReconciliacao | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reconciliacao");
  
  // Function to generate example transaction records
  const gerarLancamentosExemplo = (): Lancamento[] => {
    const hoje = new Date();
    const dataInicial = new Date(hoje);
    dataInicial.setDate(hoje.getDate() - 30);
    
    const lancamentos: Lancamento[] = [];
    
    // We'll create transactions that correspond roughly to the bank transactions we generated
    // to facilitate reconciliation in the demonstration
    for (let i = 0; i < 15; i++) {
      const diferencaDias = Math.floor(Math.random() * 30);
      const data = new Date(dataInicial);
      data.setDate(dataInicial.getDate() + diferencaDias);
      
      const tipo = Math.random() > 0.5 ? 'receita' : 'despesa';
      const valor = parseFloat((Math.random() * 10000).toFixed(2));
      
      let descricao = '';
      if (tipo === 'receita') {
        const opcoes = ['Pagamento de Cliente', 'Venda mercadorias', 'Nota Fiscal', 'Serviço prestado'];
        descricao = `${opcoes[Math.floor(Math.random() * opcoes.length)]} ${Math.floor(Math.random() * 100)}`;
      } else {
        const opcoes = ['Pagamento Fornecedor', 'Conta de luz', 'Aluguel', 'DARF', 'Material escritório'];
        descricao = `${opcoes[Math.floor(Math.random() * opcoes.length)]} ${Math.floor(Math.random() * 100)}`;
      }
      
      lancamentos.push({
        id: `lanc_${i}_${Date.now()}`,
        data: data.toISOString().split('T')[0],
        valor,
        descricao,
        tipo,
        categoria: tipo === 'receita' ? 'Vendas' : 'Despesas Operacionais',
        contraparte: tipo === 'receita' ? `Cliente ${Math.floor(Math.random() * 100)}` : `Fornecedor ${Math.floor(Math.random() * 100)}`,
        status: 'classificado',
        confianca: 0.85
      });
    }
    
    return lancamentos;
  };
  
  // Function to import bank transactions
  const importarTransacoes = async () => {
    if (!periodoInicio || !periodoFim) {
      toast({
        title: "Erro ao importar transações",
        description: "Selecione o período de início e fim para importar as transações bancárias.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulating a call to the bank API
      const transacoesImportadas = await obterExtratoBancario(
        { banco: bancoSelecionado, agencia: "0001", conta: "12345-6", tipoConta: "corrente" },
        periodoInicio,
        periodoFim
      );
      
      setTransacoes(transacoesImportadas);
      
      // For demonstration purposes, we'll generate example transactions
      const lancamentosExemplo = gerarLancamentosExemplo();
      setLancamentos(lancamentosExemplo);
      
      // Clear previous reconciliation results
      setResultadoReconciliacao(null);
      
      toast({
        title: "Transações importadas",
        description: `${transacoesImportadas.length} transações bancárias importadas com sucesso.`
      });
      
    } catch (error) {
      console.error("Erro ao importar transações:", error);
      toast({
        title: "Erro ao importar transações",
        description: "Não foi possível conectar ao serviço bancário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to execute reconciliation
  const executarReconciliacao = async () => {
    if (transacoes.length === 0 || lancamentos.length === 0) {
      toast({
        title: "Impossível reconciliar",
        description: "É necessário ter transações bancárias e lançamentos para reconciliar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here we're simulating an asynchronous processing with messaging
      const resultado = await simularFluxoProcessamento(transacoes, lancamentos);
      
      // Make sure the result conforms to our expected type
      const typedResult: ResultadoReconciliacao = {
        transacoesConciliadas: resultado.transacoesConciliadas,
        transacoesNaoConciliadas: resultado.transacoesNaoConciliadas,
        lancamentosNaoConciliados: resultado.lancamentosNaoConciliados,
        totalConciliado: resultado.totalConciliado,
        totalNaoConciliado: {
          transacoes: typeof resultado.totalNaoConciliado === 'object' 
            ? resultado.totalNaoConciliado.transacoes 
            : resultado.totalNaoConciliado,
          lancamentos: typeof resultado.totalNaoConciliado === 'object'
            ? resultado.totalNaoConciliado.lancamentos
            : 0
        }
      };
      
      setResultadoReconciliacao(typedResult);
      
      toast({
        title: "Reconciliação concluída",
        description: `${resultado.transacoesConciliadas.length} itens reconciliados com sucesso.`
      });
      
    } catch (error) {
      console.error("Erro ao reconciliar:", error);
      toast({
        title: "Erro na reconciliação",
        description: "Ocorreu um erro ao tentar reconciliar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle result from autonomous resolution
  const handleResultadoResolvido = (resultadoAtualizado: ResultadoReconciliacao) => {
    setResultadoReconciliacao(resultadoAtualizado);
  };
  
  // Initialize dates for a default period (last month)
  React.useEffect(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    setPeriodoInicio(inicioMes.toISOString().split('T')[0]);
    setPeriodoFim(fimMes.toISOString().split('T')[0]);
  }, []);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Reconciliação Bancária</CardTitle>
              <CardDescription>
                Cruze transações bancárias com lançamentos para conciliação automática
              </CardDescription>
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={importarTransacoes}
                disabled={isLoading || !periodoInicio || !periodoFim}
              >
                Importar Transações
              </Button>
              <Button 
                variant="default"
                onClick={executarReconciliacao}
                disabled={isLoading || transacoes.length === 0 || lancamentos.length === 0}
              >
                {isLoading ? "Processando..." : "Reconciliar"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Banco</label>
              <select 
                className="w-full mt-1 border rounded-md p-2"
                value={bancoSelecionado}
                onChange={(e) => setBancoSelecionado(e.target.value)}
              >
                <option value="Itaú">Itaú</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Santander">Santander</option>
                <option value="Banco do Brasil">Banco do Brasil</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <input 
                type="date"
                className="w-full mt-1 border rounded-md p-2"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <input 
                type="date"
                className="w-full mt-1 border rounded-md p-2"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm">
                <div className="font-medium">Status</div>
                <div className="mt-1">
                  {isLoading ? (
                    <Badge variant="outline" className="bg-yellow-50">
                      Processando...
                    </Badge>
                  ) : transacoes.length > 0 ? (
                    <Badge variant="default" className="bg-green-600">
                      {transacoes.length} transações importadas
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Aguardando importação
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {isLoading && (
            <div className="my-8">
              <Progress value={45} className="mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                Processando dados e executando algoritmos de reconciliação...
              </p>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="reconciliacao">Reconciliação</TabsTrigger>
              <TabsTrigger value="transacoes">Transações Bancárias</TabsTrigger>
              <TabsTrigger value="lancamentos">Lançamentos Contábeis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reconciliacao">
              {resultadoReconciliacao ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Reconciliados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-2xl font-bold">
                            {resultadoReconciliacao.transacoesConciliadas.length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Transações não conciliadas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Search className="h-5 w-5 text-amber-600 mr-2" />
                          <span className="text-2xl font-bold">
                            {resultadoReconciliacao.transacoesNaoConciliadas.length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Lançamentos não conciliados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-2xl font-bold">
                            {resultadoReconciliacao.lancamentosNaoConciliados.length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="bg-muted p-3 rounded-t-md font-medium">
                      Itens reconciliados
                    </div>
                    
                    <div className="divide-y">
                      {resultadoReconciliacao.transacoesConciliadas.map((item) => (
                        <div key={`${item.transacao.id}-${item.lancamento.id}`} className="p-3 hover:bg-muted/50">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                              <span className="font-medium">
                                {item.conciliacaoAutomatica ? 'Reconciliação automática' : 'Reconciliação assistida'}
                              </span>
                            </div>
                            <Badge className="bg-green-50 text-green-800 hover:bg-green-100">
                              Score: {(item.score * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border rounded p-2 bg-slate-50">
                              <div className="text-sm text-slate-500 mb-1">Transação Bancária</div>
                              <div>R$ {item.transacao.valor.toFixed(2)} • {item.transacao.data}</div>
                              <div className="text-sm truncate">{item.transacao.descricao}</div>
                            </div>
                            
                            <div className="border rounded p-2 bg-blue-50">
                              <div className="text-sm text-blue-500 mb-1">Lançamento Contábil</div>
                              <div>R$ {item.lancamento.valor.toFixed(2)} • {item.lancamento.data}</div>
                              <div className="text-sm truncate">{item.lancamento.descricao}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Categoria: {item.lancamento.categoria}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {resultadoReconciliacao.transacoesConciliadas.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          Nenhum item foi reconciliado. Tente ajustar os parâmetros de reconciliação.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(resultadoReconciliacao.transacoesNaoConciliadas.length > 0 || 
                    resultadoReconciliacao.lancamentosNaoConciliados.length > 0) && (
                    <Alert className="mt-4" variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Itens não reconciliados</AlertTitle>
                      <AlertDescription>
                        {resultadoReconciliacao.transacoesNaoConciliadas.length} transações e{' '}
                        {resultadoReconciliacao.lancamentosNaoConciliados.length} lançamentos não foram reconciliados.
                        Recomenda-se verificar manualmente estes itens ou usar a resolução autônoma.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Reconciliação Pendente</AlertTitle>
                  <AlertDescription>
                    Importe transações bancárias e clique em "Reconciliar" para iniciar o processo.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Nova seção de resolução autônoma */}
              <ResolucaoAutonoma 
                resultadoReconciliacao={resultadoReconciliacao}
                onResultadoResolvido={handleResultadoResolvido}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="transacoes">
              {transacoes.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 bg-muted p-3 rounded-t-md font-medium text-sm">
                    <div className="col-span-2">Data</div>
                    <div className="col-span-4">Descrição</div>
                    <div className="col-span-2">Valor</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  
                  <div className="divide-y">
                    {transacoes.map((transacao) => {
                      // Check if the transaction is reconciled
                      const reconciliada = resultadoReconciliacao?.transacoesConciliadas.some(
                        item => item.transacao.id === transacao.id
                      );
                      
                      return (
                        <div key={transacao.id} className="grid grid-cols-12 p-3 hover:bg-muted/50">
                          <div className="col-span-2">{transacao.data}</div>
                          <div className="col-span-4">{transacao.descricao}</div>
                          <div className="col-span-2">R$ {transacao.valor.toFixed(2)}</div>
                          <div className="col-span-2">
                            <Badge variant={transacao.tipo === 'credito' ? 'default' : 'destructive'}>
                              {transacao.tipo}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            {reconciliada ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800">
                                Reconciliada
                              </Badge>
                            ) : (
                              <Badge variant="outline">Não reconciliada</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sem transações</AlertTitle>
                  <AlertDescription>
                    Importe transações bancárias para visualizar os dados nesta aba.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="lancamentos">
              {lancamentos.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 bg-muted p-3 rounded-t-md font-medium text-sm">
                    <div className="col-span-2">Data</div>
                    <div className="col-span-3">Descrição</div>
                    <div className="col-span-2">Valor</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-2">Categoria</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  
                  <div className="divide-y">
                    {lancamentos.map((lancamento) => {
                      // Check if the transaction is reconciled
                      const reconciliado = resultadoReconciliacao?.transacoesConciliadas.some(
                        item => item.lancamento.id === lancamento.id
                      );
                      
                      return (
                        <div key={lancamento.id} className="grid grid-cols-12 p-3 hover:bg-muted/50">
                          <div className="col-span-2">{lancamento.data}</div>
                          <div className="col-span-3">{lancamento.descricao}</div>
                          <div className="col-span-2">R$ {lancamento.valor.toFixed(2)}</div>
                          <div className="col-span-2">
                            <Badge variant={lancamento.tipo === 'receita' ? 'default' : 'destructive'}>
                              {lancamento.tipo}
                            </Badge>
                          </div>
                          <div className="col-span-2">{lancamento.categoria}</div>
                          <div className="col-span-1">
                            {reconciliado ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                OK
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <X className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sem lançamentos</AlertTitle>
                  <AlertDescription>
                    Os lançamentos serão gerados automaticamente quando você importar transações bancárias.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
