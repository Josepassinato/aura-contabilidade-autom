import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calculator, FileText, BarChart3, DollarSign, TrendingUp } from "lucide-react";
import { PlanoContasManager } from "@/components/contabil/PlanoContasManager";
import { LancamentosContabeis } from "@/components/contabil/LancamentosContabeis";
import { BalancetesManager } from "@/components/contabil/BalancetesManager";
import { CentroCustosManager } from "@/components/contabil/CentroCustosManager";
import { RelatoriosContabeis } from "@/components/contabil/RelatoriosContabeis";
import { AnaliseFinanceira } from "@/components/contabil/AnaliseFinanceira";

export default function Contabilidade() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const ContabilidadeDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contabilidade</h1>
        <p className="text-muted-foreground">
          Sistema completo de gestão contábil
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.234,12</div>
            <p className="text-xs text-muted-foreground">-4% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 32.997,77</div>
            <p className="text-xs text-muted-foreground">Lucro líquido do período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lançamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.234</div>
            <p className="text-xs text-muted-foreground">Lançamentos realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu de ações */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("plano-contas")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Plano de Contas
            </CardTitle>
            <CardDescription>
              Gerencie a estrutura de contas contábeis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("lancamentos")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lançamentos Contábeis
            </CardTitle>
            <CardDescription>
              Registre e gerencie lançamentos contábeis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("balancetes")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Balancetes
            </CardTitle>
            <CardDescription>
              Gere e visualize balancetes periódicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("centro-custos")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Centro de Custos
            </CardTitle>
            <CardDescription>
              Configure centros de custos para análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("relatorios")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatórios Contábeis
            </CardTitle>
            <CardDescription>
              DRE, Balanço Patrimonial e outros relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("analises")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análises Financeiras
            </CardTitle>
            <CardDescription>
              Indicadores e análises financeiras avançadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plano-contas">Plano de Contas</TabsTrigger>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="balancetes">Balancetes</TabsTrigger>
          <TabsTrigger value="centro-custos">Centro de Custos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <ContabilidadeDashboard />
        </TabsContent>

        <TabsContent value="plano-contas" className="mt-6">
          <PlanoContasManager />
        </TabsContent>

        <TabsContent value="lancamentos" className="mt-6">
          <LancamentosContabeis />
        </TabsContent>

        <TabsContent value="balancetes" className="mt-6">
          <BalancetesManager />
        </TabsContent>

        <TabsContent value="centro-custos" className="mt-6">
          <CentroCustosManager />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <RelatoriosContabeis />
        </TabsContent>

        <TabsContent value="analises" className="mt-6">
          <AnaliseFinanceira />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}