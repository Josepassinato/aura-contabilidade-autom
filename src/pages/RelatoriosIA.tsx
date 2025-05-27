
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, Mic, Settings, ListFilter } from "lucide-react";
import { Link } from 'react-router-dom';
import { GeracaoRelatorioPorVoz } from '@/components/relatorios/GeracaoRelatorioPorVoz';
import { ReportsList } from '@/components/relatorios/ReportsList';
import { VoiceAssistantConfig } from '@/components/dashboard/voice-assistant/VoiceAssistantConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isOpenAIConfigured } from '@/components/settings/openai/supabaseOpenAiService';

const RelatoriosIA = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [openAIConfigured, setOpenAIConfigured] = useState(false);
  
  useEffect(() => {
    // Verificar se OpenAI está configurada
    setOpenAIConfigured(isOpenAIConfigured());
    
    // Ouvir por mudanças na configuração da OpenAI
    const handleConfigUpdate = () => {
      setOpenAIConfigured(isOpenAIConfigured());
    };
    
    window.addEventListener('openai-config-updated', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('openai-config-updated', handleConfigUpdate);
    };
  }, []);
  
  const handleGerarRelatorio = () => {
    setIsProcessing(true);
    
    // Simulação de processamento
    setTimeout(() => {
      setIsProcessing(false);
      setRelatorioGerado(true);
    }, 2000);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios por Inteligência Artificial</h2>
          <p className="text-muted-foreground mt-2">
            Gere relatórios personalizados usando nosso assistente de IA
          </p>
        </div>
        
        {!openAIConfigured && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium">Configuração necessária</h3>
                  <p className="text-sm mt-1">
                    Para utilizar os recursos de IA, é necessário configurar a API da OpenAI. 
                    <Link to="/settings?openai=true" className="text-primary ml-1 underline">
                      Clique aqui para configurar.
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="assistente" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assistente" className="flex items-center gap-1.5">
              <Mic className="h-4 w-4" />
              Assistente de Voz
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-1.5">
              <FileBarChart className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="relatorios-salvos" className="flex items-center gap-1.5">
              <ListFilter className="h-4 w-4" />
              Relatórios Salvos
            </TabsTrigger>
            <TabsTrigger value="configuracao" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="assistente" className="space-y-4">
            <GeracaoRelatorioPorVoz />
          </TabsContent>
          
          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5 text-primary" />
                  <CardTitle>Relatórios Personalizados por IA</CardTitle>
                </div>
                <CardDescription>
                  Use nosso assistente por voz ou texto para criar relatórios específicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-medium mb-2">Solicite um relatório personalizado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use linguagem natural para solicitar relatórios detalhados sobre o desempenho financeiro, 
                      comparativos de períodos ou análise de indicadores específicos.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="flex gap-2" 
                      onClick={handleGerarRelatorio} 
                      disabled={isProcessing || !openAIConfigured}
                    >
                      <FileBarChart className="h-4 w-4" />
                      {isProcessing ? "Gerando..." : "Gerar Relatório de Exemplo"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex gap-2"
                      disabled={!openAIConfigured}
                    >
                      <Mic className="h-4 w-4" />
                      Usar Assistente de Voz
                    </Button>
                  </div>
                </div>
                
                {!openAIConfigured && (
                  <div className="text-center p-4 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Configure a API OpenAI nas configurações do sistema para utilizar este recurso.
                    </p>
                  </div>
                )}
                
                {relatorioGerado && (
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-medium mb-3">Relatório Gerado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este é um exemplo de relatório gerado pela IA. Em uma implementação completa, 
                      aqui seria exibido um relatório detalhado com gráficos e análises.
                    </p>
                    <div className="bg-muted p-4 rounded text-sm">
                      <p className="font-medium">Análise de Desempenho Financeiro - 2024</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Faturamento total do período: R$ 1.250.000,00</li>
                        <li>Crescimento de 15% em relação ao mesmo período do ano anterior</li>
                        <li>Principais categorias de despesas: Pessoal (45%), Infraestrutura (20%), Marketing (15%)</li>
                        <li>Margem de lucro atual: 22% (aumento de 3% em relação ao período anterior)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="relatorios-salvos">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ListFilter className="h-5 w-5 text-primary" />
                  <CardTitle>Relatórios Salvos</CardTitle>
                </div>
                <CardDescription>
                  Visualize e gerencie todos os relatórios que foram gerados e salvos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="configuracao">
            <VoiceAssistantConfig />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RelatoriosIA;
