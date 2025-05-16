
import React, { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ClientSelector } from "@/components/layout/ClientSelector";

// Lazy loading dos componentes de relatório
const DRE = lazy(() => import('@/components/relatorios/DRE').then(module => ({ default: module.DRE })));
const BalancoPatrimonial = lazy(() => import('@/components/relatorios/BalancoPatrimonial').then(module => ({ default: module.BalancoPatrimonial })));
const FluxoCaixa = lazy(() => import('@/components/relatorios/FluxoCaixa').then(module => ({ default: module.FluxoCaixa })));
const IndexesFinanceiros = lazy(() => import('@/components/relatorios/IndexesFinanceiros').then(module => ({ default: module.IndexesFinanceiros })));
const GeracaoRelatorioPorVoz = lazy(() => import('@/components/relatorios/GeracaoRelatorioPorVoz').then(module => ({ default: module.GeracaoRelatorioPorVoz })));

// Componente de fallback durante o carregamento
const LoadingSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

export default function RelatoriosFinanceiros() {
  const [activeTab, setActiveTab] = useState("dre");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState("");

  const handleClientSelect = (client: { id: string; name: string }) => {
    setSelectedClientId(client.id);
  };

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodo(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Relatórios Financeiros</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Período</label>
          <select 
            className="w-full border border-input rounded-md px-3 h-10" 
            value={periodo}
            onChange={handlePeriodoChange}
          >
            <option value="">Selecione um período</option>
            <option value="202101">Janeiro 2021</option>
            <option value="202102">Fevereiro 2021</option>
            <option value="202103">Março 2021</option>
          </select>
        </div>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-5">
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="balanco">Balanço</TabsTrigger>
            <TabsTrigger value="fluxocaixa">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="indexes">Índices</TabsTrigger>
            <TabsTrigger value="geracao" className="hidden md:block">Gerar Relatório</TabsTrigger>
          </TabsList>

          <TabsContent value="dre">
            <Suspense fallback={<LoadingSkeleton />}>
              <DRE clientId={selectedClientId} periodo={periodo} />
            </Suspense>
          </TabsContent>

          <TabsContent value="balanco">
            <Suspense fallback={<LoadingSkeleton />}>
              <BalancoPatrimonial clientId={selectedClientId} periodo={periodo} />
            </Suspense>
          </TabsContent>

          <TabsContent value="fluxocaixa">
            <Suspense fallback={<LoadingSkeleton />}>
              <FluxoCaixa clientId={selectedClientId} periodo={periodo} />
            </Suspense>
          </TabsContent>

          <TabsContent value="indexes">
            <Suspense fallback={<LoadingSkeleton />}>
              <IndexesFinanceiros clientId={selectedClientId} periodo={periodo} />
            </Suspense>
          </TabsContent>

          <TabsContent value="geracao">
            <Suspense fallback={<LoadingSkeleton />}>
              <GeracaoRelatorioPorVoz />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
