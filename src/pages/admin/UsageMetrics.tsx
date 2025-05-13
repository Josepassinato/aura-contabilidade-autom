
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { AccessRestriction } from "@/components/settings/AccessRestriction";
import { UsersRoleMetric } from "@/components/admin/metrics/UsersRoleMetric";
import { AIAssistantMetrics } from "@/components/admin/metrics/AIAssistantMetrics"; 
import { DocumentMetrics } from "@/components/admin/metrics/DocumentMetrics";
import { FeaturesUsageMetrics } from "@/components/admin/metrics/FeaturesUsageMetrics";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";

const UsageMetrics = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(false);

  const handleExportData = () => {
    // Logic to export data to CSV would go here
    alert("Exportando dados para CSV...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Show access restriction if user is not admin
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <AccessRestriction />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Métricas de Uso</h1>
            <p className="text-muted-foreground">
              Analise o uso do sistema e identifique padrões e tendências
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="ai">Assistente de IA</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="features">Recursos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <UsersRoleMetric isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-6">
            <AIAssistantMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            <DocumentMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="features" className="space-y-6">
            <FeaturesUsageMetrics isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UsageMetrics;
