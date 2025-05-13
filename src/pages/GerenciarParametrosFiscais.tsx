
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParametrosFiscaisForm } from "@/components/settings/tax/ParametrosFiscaisForm";
import { ConsultoriaIntegracaoForm } from "@/components/settings/tax/ConsultoriaIntegracaoForm";
import { ParametrosFiscaisHistorico } from "@/components/settings/tax/ParametrosFiscaisHistorico";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import { Settings, Globe, History } from "lucide-react";

const GerenciarParametrosFiscais = () => {
  const [activeTab, setActiveTab] = useState("parametros");
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only admins should access this page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Parâmetros Fiscais</h1>
          <p className="text-muted-foreground">
            Mantenha os parâmetros de cálculos fiscais sempre atualizados com as legislações federais e estaduais.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="parametros" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Parâmetros
            </TabsTrigger>
            <TabsTrigger value="consultorias" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Consultorias
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parametros">
            <ParametrosFiscaisForm />
          </TabsContent>

          <TabsContent value="consultorias">
            <ConsultoriaIntegracaoForm />
          </TabsContent>

          <TabsContent value="historico">
            <ParametrosFiscaisHistorico />
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Documentação Fiscal</CardTitle>
            <CardDescription>
              Acesse a documentação completa sobre os parâmetros fiscais e como eles são aplicados nos cálculos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                <CardHeader className="p-4">
                  <CardTitle className="text-md">Guia de Parâmetros Fiscais</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm">
                  Documentação detalhada sobre os parâmetros fiscais e seu impacto nos cálculos.
                </CardContent>
              </Card>
              
              <Card className="bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                <CardHeader className="p-4">
                  <CardTitle className="text-md">Políticas de Atualização</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm">
                  Diretrizes e boas práticas para manter os parâmetros fiscais atualizados.
                </CardContent>
              </Card>
              
              <Card className="bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                <CardHeader className="p-4">
                  <CardTitle className="text-md">Integração com Consultorias</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm">
                  Como configurar e gerenciar integrações com consultorias fiscais especializadas.
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GerenciarParametrosFiscais;
