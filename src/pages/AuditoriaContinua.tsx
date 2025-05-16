
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuditoriaContinuaConfig } from "@/components/fiscal/auditoria/AuditoriaContinuaConfig";
import { AuditoriaDashboard } from "@/components/fiscal/auditoria/AuditoriaDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReconciliacaoBancaria } from "@/components/fiscal/reconciliacao/ReconciliacaoBancaria";

const AuditoriaContinua = () => {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
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
            <ReconciliacaoBancaria />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditoriaContinua;
