
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Clock, BrainCircuit, Sliders } from "lucide-react";
import { ConfiguracaoIngestaoDados } from "./ConfiguracaoIngestaoDados";

export function ConfiguracaoApuracao() {
  const [activeTab, setActiveTab] = useState("fontes");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Apuração Automática</CardTitle>
          <CardDescription>
            Defina parâmetros para o processamento automático de dados contábeis e fiscais
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 gap-4">
              <TabsTrigger value="fontes" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Fontes de Dados
              </TabsTrigger>
              <TabsTrigger value="parametros" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Parâmetros Fiscais
              </TabsTrigger>
              <TabsTrigger value="agendamento" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Agendamento
              </TabsTrigger>
              <TabsTrigger value="ia" className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                Configuração IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fontes">
              <ConfiguracaoIngestaoDados onComplete={() => setActiveTab("parametros")} />
            </TabsContent>

            <TabsContent value="parametros">
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros Fiscais</CardTitle>
                  <CardDescription>
                    Configure os parâmetros fiscais para processamento automático
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <Settings className="mx-auto h-12 w-12 opacity-30 mb-2" />
                    <p>Configuração de parâmetros fiscais</p>
                    <p className="text-sm">Aqui serão configurados os parâmetros para cálculos fiscais</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agendamento">
              <Card>
                <CardHeader>
                  <CardTitle>Agendamento de Processos</CardTitle>
                  <CardDescription>
                    Configure a programação para execução automática da apuração
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 opacity-30 mb-2" />
                    <p>Configuração de agendamento automático</p>
                    <p className="text-sm">Aqui serão configurados os horários e frequências de processamento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ia">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração da Inteligência Artificial</CardTitle>
                  <CardDescription>
                    Configure o comportamento da IA para classificação e processamento automático
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <BrainCircuit className="mx-auto h-12 w-12 opacity-30 mb-2" />
                    <p>Configuração de inteligência artificial</p>
                    <p className="text-sm">Aqui serão configurados os parâmetros de IA para processamento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

