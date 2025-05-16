
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuditoriaContinuaConfig } from "@/components/fiscal/auditoria/AuditoriaContinuaConfig";
import { AuditoriaDashboard } from "@/components/fiscal/auditoria/AuditoriaDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReconciliacaoBancaria } from "@/components/fiscal/reconciliacao/ReconciliacaoBancaria";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AuditoriaContinua = () => {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Auditoria Contínua</h2>
            <p className="text-muted-foreground">
              Sistemas inteligentes para auditoria, reconciliação e validação contínua
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
              <Brain className="h-3.5 w-3.5 mr-1" />
              IA Avançada
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Automação
            </Badge>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
            <TabsTrigger value="reconciliacao">Reconciliação Autônoma</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AuditoriaDashboard />
          </TabsContent>
          
          <TabsContent value="configuracao">
            <AuditoriaContinuaConfig />
          </TabsContent>
          
          <TabsContent value="reconciliacao">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Sistema de Reconciliação Bancária com Aprendizado de Máquina</CardTitle>
                <CardDescription>
                  O sistema utiliza IA para reconciliar transações bancárias com lançamentos contábeis, 
                  aprendendo com as decisões humanas para melhorar sua precisão ao longo do tempo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                      Resolução Autônoma
                    </div>
                    <p className="text-muted-foreground">
                      Resolve automaticamente discrepâncias seguindo regras configuráveis 
                      como tolerância de divergência e correspondência de descrições.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2 flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-500" />
                      Aprendizado de Máquina
                    </div>
                    <p className="text-muted-foreground">
                      Aprende com decisões humanas anteriores para ajustar automaticamente
                      seus parâmetros e melhorar a precisão das reconciliações futuras.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Recomendações Inteligentes</div>
                    <p className="text-muted-foreground">
                      Gera insights e recomendações de configuração com base em padrões 
                      detectados no histórico de reconciliações.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ReconciliacaoBancaria />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditoriaContinua;
