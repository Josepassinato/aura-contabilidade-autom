
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CalculadoraFiscal } from "@/components/fiscal/CalculadoraFiscal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';

const CalculosFiscais = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("calculadora");

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
        <TabsList>
          <TabsTrigger value="calculadora">Calculadora Fiscal</TabsTrigger>
          <TabsTrigger value="simulacao">Simulação de Regimes</TabsTrigger>
          <TabsTrigger value="retencoes">Retenções</TabsTrigger>
        </TabsList>

        <TabsContent value="calculadora">
          <CalculadoraFiscal />
        </TabsContent>

        <TabsContent value="simulacao">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Regimes Tributários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de simulação entre regimes tributários em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retencoes">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de Retenções</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de cálculo de retenções em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CalculosFiscais;
