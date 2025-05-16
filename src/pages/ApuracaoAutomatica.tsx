
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, Database, SparklesIcon, Settings, BrainCircuit } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { ApuracaoResults } from "@/components/apuracao/ApuracaoResults";
import { ProcessamentoStatus } from "@/components/apuracao/ProcessamentoStatus";
import { ConfiguracaoApuracao } from "@/components/apuracao/ConfiguracaoApuracao";
import { IntelligentApuracaoForm } from "@/components/apuracao/IntelligentApuracaoForm";
import { 
  processarApuracao,
  processarApuracaoEmLote, 
  ResultadoApuracao 
} from "@/services/apuracao/apuracaoService";

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
          categorizacaoAutomatica: true
        }
      );
      
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
                  Iniciar Apuração Automática
                </Button>
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

        {/* Nova aba para apuração inteligente com NLP */}
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
