
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { CalculadoraFiscal } from "@/components/fiscal/CalculadoraFiscal";
import { CalculoNotasFiscais } from "@/components/fiscal/calculadora/CalculoNotasFiscais";
import { CalculoLancamentos } from "@/components/fiscal/calculadora/CalculoLancamentos";
import { TabsEmDesenvolvimento } from "@/components/fiscal/calculadora/TabsEmDesenvolvimento";
import { usePagamentoImposto } from "@/components/fiscal/calculadora/usePagamentoImposto";
import { TipoImposto, ResultadoCalculo } from "@/services/fiscal/types";
import WorkflowOrquestrador from "@/components/fiscal/workflow/WorkflowOrquestrador";
import { ProcessamentoAutomatico } from "@/components/contabil/ProcessamentoAutomatico";
import { checkForAuthLimboState, cleanupAuthState } from '@/contexts/auth/cleanupUtils';
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CalculosFiscais = () => {
  const { isAuthenticated, isAccountant, isLoading, navigateToLogin } = useAuth();
  const [activeTab, setActiveTab] = useState("processamento");
  const [cnpj, setCnpj] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [regimeTributario, setRegimeTributario] = useState<"Simples" | "LucroPresumido" | "LucroReal">("LucroPresumido");
  const [resultados, setResultados] = useState<Record<TipoImposto, ResultadoCalculo> | null>(null);
  const navigate = useNavigate();
  
  const { 
    handlePagamento, 
    pagamentoStatus, 
    isLoading: pagamentoLoading, 
    setIsLoading, 
    selectedBanco 
  } = usePagamentoImposto(cnpj, periodo);
  
  // Check for auth limbo state on page load
  useEffect(() => {
    console.log("CalculosFiscais - Checking auth state");
    
    if (checkForAuthLimboState()) {
      console.warn("Auth limbo state detected in CalculosFiscais, cleaning up");
      cleanupAuthState();
      toast({
        title: "Estado de autenticação inconsistente",
        description: "Por favor, faça login novamente para continuar.",
        variant: "destructive",
      });
      navigateToLogin();
    }
  }, [navigateToLogin]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated in CalculosFiscais, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Only accountants should access this page
  if (!isAccountant) {
    console.log("User is not an accountant, redirecting to dashboard");
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cálculos Fiscais</h1>
          <p className="text-muted-foreground">
            Ferramentas para cálculos fiscais automáticos e simulações tributárias
          </p>
        </div>
        <ClientSelector />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="processamento">Processamento Automático</TabsTrigger>
          <TabsTrigger value="calculadora">Calculadora Fiscal</TabsTrigger>
          <TabsTrigger value="notas">Cálculo por Notas Fiscais</TabsTrigger>
          <TabsTrigger value="lancamentos">Cálculo por Lançamentos</TabsTrigger>
          <TabsTrigger value="simulacao">Simulação de Regimes</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Fiscal</TabsTrigger>
          <TabsTrigger value="retencoes">Retenções</TabsTrigger>
        </TabsList>

        <TabsContent value="processamento">
          <ProcessamentoAutomatico />
        </TabsContent>

        <TabsContent value="calculadora">
          <CalculadoraFiscal />
        </TabsContent>
        
        <TabsContent value="notas">
          <CalculoNotasFiscais
            cnpj={cnpj}
            setCnpj={setCnpj}
            periodo={periodo}
            setPeriodo={setPeriodo}
            regimeTributario={regimeTributario}
            setRegimeTributario={setRegimeTributario}
            resultados={resultados}
            setResultados={setResultados}
            isLoading={pagamentoLoading}
            setIsLoading={setIsLoading}
            selectedBanco={selectedBanco}
            pagamentoStatus={pagamentoStatus}
            onPagamento={handlePagamento}
          />
        </TabsContent>
        
        <TabsContent value="lancamentos">
          <CalculoLancamentos
            cnpj={cnpj}
            setCnpj={setCnpj}
            periodo={periodo}
            setPeriodo={setPeriodo}
            regimeTributario={regimeTributario}
            setRegimeTributario={setRegimeTributario}
            resultados={resultados}
            setResultados={setResultados}
            isLoading={pagamentoLoading}
            setIsLoading={setIsLoading}
            selectedBanco={selectedBanco}
            pagamentoStatus={pagamentoStatus}
            onPagamento={handlePagamento}
          />
        </TabsContent>

        <TabsContent value="simulacao">
          <TabsEmDesenvolvimento title="Simulação de Regimes Tributários" />
        </TabsContent>

        <TabsContent value="workflow">
          <WorkflowOrquestrador />
        </TabsContent>

        <TabsContent value="retencoes">
          <TabsEmDesenvolvimento title="Cálculo de Retenções" />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CalculosFiscais;
