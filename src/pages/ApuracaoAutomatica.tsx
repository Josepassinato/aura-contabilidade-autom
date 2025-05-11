
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Calculator, FileText, CheckCircle, Database } from "lucide-react";
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
  
  // Simular o início do processamento automático
  const iniciarProcessamento = async () => {
    try {
      setProcessando(true);
      setProgress(0);
      setClientesProcessados(0);
      
      // Simular busca de clientes
      const clientes = [
        { id: 1, nome: "Empresa ABC Ltda", cnpj: "12.345.678/0001-99" },
        { id: 2, nome: "XYZ Comércio S.A.", cnpj: "98.765.432/0001-10" }, 
        { id: 3, nome: "Tech Solutions", cnpj: "45.678.901/0001-23" }
      ];
      
      setTotalClientes(clientes.length);
      
      // Simular processamento para cada cliente
      const resultadosProcessamento = [];
      for (const cliente of clientes) {
        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Gerar dados fictícios baseados no regime tributário
        const resultado = gerarResultadoSimulado(cliente, regimeTributario);
        resultadosProcessamento.push(resultado);
        
        // Atualizar progresso
        setClientesProcessados(prev => prev + 1);
        setProgress(Math.round(((resultadosProcessamento.length) / clientes.length) * 100));
      }
      
      // Finalizar processamento
      setResultados(resultadosProcessamento);
      setActiveTab("resultados");
      
      toast({
        title: "Processamento concluído",
        description: `${clientes.length} empresas foram processadas com sucesso.`,
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
  
  // Função para gerar resultados simulados
  const gerarResultadoSimulado = (cliente: any, regime: string) => {
    // Valores fictícios para demonstração
    const receita = Math.random() * 1000000 + 100000;
    const aliquota = regime === "lucro_presumido" ? 0.08 : 0.15;
    const baseCalculo = regime === "lucro_presumido" ? receita * 0.32 : receita * 0.8;
    const imposto = baseCalculo * aliquota;
    
    return {
      cliente: cliente,
      trimestre: "1° Trimestre/2025",
      receita: receita.toFixed(2),
      baseCalculo: baseCalculo.toFixed(2),
      aliquota: (aliquota * 100).toFixed(2) + "%",
      imposto: imposto.toFixed(2),
      status: Math.random() > 0.2 ? "Processado" : "Pendente de Confirmação",
      documentos: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date().toISOString()
    };
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
