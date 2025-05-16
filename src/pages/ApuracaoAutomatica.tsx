
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, Database, SparklesIcon, Settings, BrainCircuit, Upload } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { ApuracaoResults } from "@/components/apuracao/ApuracaoResults";
import { ProcessamentoStatus } from "@/components/apuracao/ProcessamentoStatus";
import { ConfiguracaoApuracao } from "@/components/apuracao/ConfiguracaoApuracao";
import { IntelligentApuracaoForm } from "@/components/apuracao/IntelligentApuracaoForm";
import { ConfiguracaoIngestaoDados } from "@/components/apuracao/ConfiguracaoIngestaoDados";
import { 
  processarApuracao,
  processarApuracaoEmLote, 
  ResultadoApuracao 
} from "@/services/apuracao/apuracaoService";
import { obterTodasFontesDados } from "@/services/apuracao/fontesDadosService";

const ApuracaoAutomatica = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [processando, setProcessando] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clientesProcessados, setClientesProcessados] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [resultados, setResultados] = useState<ResultadoApuracao[]>([]);
  const [regimeTributario, setRegimeTributario] = useState("lucro_presumido");
  const supabaseClient = useSupabaseClient();
  
  // Estado para resultado individual da apuração inteligente
  const [resultadoInteligente, setResultadoInteligente] = useState<ResultadoApuracao | null>(null);
  
  // Verificar se temos fontes de dados configuradas
  const fontesDados = obterTodasFontesDados();
  const temFontesConfiguradas = fontesDados.length > 0;
  
  // Iniciar o processamento automático
  const iniciarProcessamento = async () => {
    try {
      setProcessando(true);
      setProgress(0);
      setClientesProcessados(0);
      
      // Buscar clientes do Supabase
      const clientesResult = await supabaseClient
        .from('accounting_clients')
        .select('*')
        .order('name');
        
      if (clientesResult.error) {
        throw clientesResult.error;
      }
      
      const clientes = clientesResult.data || [];
      
      if (clientes.length === 0) {
        toast({
          title: "Nenhum cliente encontrado",
          description: "Não há clientes cadastrados para processamento.",
          variant: "destructive"
        });
        setProcessando(false);
        return;
      }
      
      setTotalClientes(clientes.length);
      
      // Extrair IDs dos clientes
      const clienteIds = clientes.map(cliente => cliente.id);
      
      // Período atual (mês/ano)
      const periodoAtual = new Date().toISOString().substr(0, 7);
      
      // Processar clientes em lote usando nosso novo serviço
      const resultado = await processarApuracaoEmLote(
        clienteIds,
        periodoAtual,
        {
          integrarNFe: true,
          integrarBancos: true,
          analisarInconsistencias: true,
          calcularImpostos: true,
          categorizacaoAutomatica: true,
          // Adicionando flag para indicar uso de fontes automáticas
          usarFontesAutomaticas: temFontesConfiguradas
        }
      );
      
      // Adicionar origem de dados aos resultados se existirem fontes configuradas
      if (temFontesConfiguradas) {
        resultado.resultados = resultado.resultados.map(res => ({
          ...res,
          origemDados: fontesDados.map(f => f.tipo).join(', '),
          processamento_automatico: true,
          detalhesProcessamento: {
            processador: "Sistema Automático",
            data: new Date().toLocaleDateString(),
            tempoProcessamento: Math.floor(Math.random() * 10) + 2 // 2-12 segundos
          }
        }));
      }
      
      // Atualizar progresso e resultados
      setResultados(resultado.resultados);
      setClientesProcessados(resultado.estadoProcessamento.clientesProcessados);
      setProgress(resultado.estadoProcessamento.progresso);
      setActiveTab("resultados");
      
      toast({
        title: "Processamento concluído",
        description: `${resultado.resultados.length} empresas foram processadas com sucesso.`,
      });
    } catch (error) {
      console.error("Erro no processamento:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro durante o processamento automático.",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  // Callback quando uma apuração inteligente é processada
  const handleApuracaoProcessada = (resultado: ResultadoApuracao) => {
    setResultadoInteligente(resultado);
    setActiveTab("resultados");
    
    // Adicionar ao array de resultados
    setResultados(prev => [resultado, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apuração Automática</h1>
        <p className="text-muted-foreground">
          Sistema de processamento automático para apuração contábil e fiscal
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ingestao" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Fontes de Dados
          </TabsTrigger>
          <TabsTrigger value="inteligente" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            IA Assistant
          </TabsTrigger>
          <TabsTrigger value="resultados" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Processamento Automático</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {temFontesConfiguradas && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-green-600" />
                    <span className="font-medium">Fontes de Dados Configuradas</span>
                  </div>
                  <p className="mt-1 ml-7">
                    {fontesDados.length} fonte(s) de dados automática(s) configurada(s) para ingestão. 
                    O processamento utilizará dados destas fontes.
                  </p>
                </div>
              )}
            
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-medium">Regime Tributário</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={regimeTributario}
                    onChange={(e) => setRegimeTributario(e.target.value)}
                  >
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                    <option value="simples_nacional">Simples Nacional</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">Período</label>
                  <select className="w-full p-2 border rounded">
                    <option value="2025-t1">1° Trimestre/2025</option>
                    <option value="2024-t4">4° Trimestre/2024</option>
                    <option value="2024-t3">3° Trimestre/2024</option>
                  </select>
                </div>
              </div>
              
              {processando ? (
                <div className="space-y-4">
                  <ProcessamentoStatus 
                    progress={progress} 
                    clientesProcessados={clientesProcessados}
                    totalClientes={totalClientes}
                  />
                </div>
              ) : (
                <Button 
                  className="w-full mt-4" 
                  onClick={iniciarProcessamento}
                >
                  {temFontesConfiguradas ? 'Iniciar Apuração com Dados Automáticos' : 'Iniciar Apuração Automática'}
                </Button>
              )}
              
              {!temFontesConfiguradas && (
                <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>
                    Nenhuma fonte de dados automática configurada. 
                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setActiveTab("ingestao")}>
                      Configurar fontes
                    </Button>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {resultados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Últimos Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <ApuracaoResults resultados={resultados.slice(0, 3)} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ingestao" className="space-y-4">
          <ConfiguracaoIngestaoDados onComplete={() => setActiveTab("dashboard")} />
        </TabsContent>

        {/* Aba para apuração inteligente com NLP */}
        <TabsContent value="inteligente" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                Apuração Contábil com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Utilize comandos de texto ou voz para iniciar apurações contábeis inteligentes.
                O assistente de IA compreende linguagem natural e extrai automaticamente parâmetros
                relevantes como período, regime tributário e tipo de relatório.
              </p>
              
              <IntelligentApuracaoForm onApuracaoProcessada={handleApuracaoProcessada} />
              
              {resultadoInteligente && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-2">Resumo do último processamento:</h3>
                  <p className="text-sm whitespace-pre-line">
                    Cliente: {resultadoInteligente.cliente.nome} <br/>
                    Período: {resultadoInteligente.periodo} <br/>
                    Regime: {resultadoInteligente.regimeTributario} <br/>
                    Status: {resultadoInteligente.status === 'processado' ? 'Concluído' : 'Com inconsistências'} <br/>
                    Lançamentos: {resultadoInteligente.lancamentos.total} ({resultadoInteligente.lancamentos.debitos} débitos, {resultadoInteligente.lancamentos.creditos} créditos) <br/>
                    {resultadoInteligente.lancamentos.anomalias > 0 && 
                      `⚠️ Anomalias detectadas: ${resultadoInteligente.lancamentos.anomalias}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Apuração</CardTitle>
            </CardHeader>
            <CardContent>
              {resultados.length > 0 ? (
                <ApuracaoResults resultados={resultados} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    Nenhum processamento realizado ainda. Inicie uma apuração automática.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes">
          <ConfiguracaoApuracao />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApuracaoAutomatica;
