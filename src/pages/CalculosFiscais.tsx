
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { CalculadoraFiscal } from "@/components/fiscal/CalculadoraFiscal";
import { CalculoNotasFiscais } from "@/components/fiscal/calculadora/CalculoNotasFiscais";
import { CalculoLancamentos } from "@/components/fiscal/calculadora/CalculoLancamentos";
import { TabsEmDesenvolvimento } from "@/components/fiscal/calculadora/TabsEmDesenvolvimento";
import { usePagamentoImposto } from "@/components/fiscal/calculadora/usePagamentoImposto";
import { TipoImposto, ResultadoCalculo } from "@/services/fiscal/types";

const CalculosFiscais = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("calculadora");
  const [cnpj, setCnpj] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [regimeTributario, setRegimeTributario] = useState<"Simples" | "LucroPresumido" | "LucroReal">("LucroPresumido");
  const [resultados, setResultados] = useState<Record<TipoImposto, ResultadoCalculo> | null>(null);
  
  const { 
    handlePagamento, 
    pagamentoStatus, 
    isLoading, 
    setIsLoading, 
    selectedBanco 
  } = usePagamentoImposto(cnpj, periodo);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only accountants should access this page
  if (!isAccountant) {
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
          <TabsTrigger value="calculadora">Calculadora Fiscal</TabsTrigger>
          <TabsTrigger value="notas">Cálculo por Notas Fiscais</TabsTrigger>
          <TabsTrigger value="lancamentos">Cálculo por Lançamentos</TabsTrigger>
          <TabsTrigger value="simulacao">Simulação de Regimes</TabsTrigger>
          <TabsTrigger value="retencoes">Retenções</TabsTrigger>
        </TabsList>

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
            isLoading={isLoading}
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
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            selectedBanco={selectedBanco}
            pagamentoStatus={pagamentoStatus}
            onPagamento={handlePagamento}
          />
        </TabsContent>

        <TabsContent value="simulacao">
          <TabsEmDesenvolvimento title="Simulação de Regimes Tributários" />
        </TabsContent>

        <TabsContent value="retencoes">
          <TabsEmDesenvolvimento title="Cálculo de Retenções" />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CalculosFiscais;
