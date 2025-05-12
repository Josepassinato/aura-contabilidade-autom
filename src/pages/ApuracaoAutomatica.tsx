
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, Database } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { ApuracaoResults } from "@/components/apuracao/ApuracaoResults";
import { ProcessamentoStatus } from "@/components/apuracao/ProcessamentoStatus";
import { ConfiguracaoApuracao } from "@/components/apuracao/ConfiguracaoApuracao";

const ApuracaoAutomatica = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [processando, setProcessando] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clientesProcessados, setClientesProcessados] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [resultados, setResultados] = useState<any[]>([]);
  const [regimeTributario, setRegimeTributario] = useState("lucro_presumido");
  const supabaseClient = useSupabaseClient();
  
  // Iniciar o processamento automático
  const iniciarProcessamento = async () => {
    try {
      setProcessando(true);
      setProgress(0);
      setClientesProcessados(0);
      
      // Buscar clientes do Supabase
      const { data: clientes, error } = await supabaseClient
        .from('accounting_clients')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      if (!clientes || clientes.length === 0) {
        toast({
          title: "Nenhum cliente encontrado",
          description: "Não há clientes cadastrados para processamento.",
          variant: "destructive"
        });
        setProcessando(false);
        return;
      }
      
      setTotalClientes(clientes.length);
      
      // Processar cada cliente
      const resultadosProcessamento = [];
      for (const cliente of clientes) {
        try {
          // Em produção, aqui seria feita a chamada para o serviço de apuração real
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação de tempo de processamento
          
          // Informação básica sobre o processamento
          const resultado = {
            cliente: cliente,
            trimestre: "1° Trimestre/2025",
            status: "Processado",
            timestamp: new Date().toISOString()
          };
          
          resultadosProcessamento.push(resultado);
          
          // Atualizar progresso
          setClientesProcessados(prev => prev + 1);
          setProgress(Math.round(((resultadosProcessamento.length) / clientes.length) * 100));
        } catch (clienteError) {
          console.error(`Erro ao processar cliente ${cliente.name}:`, clienteError);
        }
      }
      
      // Finalizar processamento
      setResultados(resultadosProcessamento);
      setActiveTab("resultados");
      
      toast({
        title: "Processamento concluído",
        description: `${resultadosProcessamento.length} empresas foram processadas com sucesso.`,
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

  return (
    <DashboardLayout>
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
            <TabsTrigger value="resultados" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
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
    </DashboardLayout>
  );
};

export default ApuracaoAutomatica;
