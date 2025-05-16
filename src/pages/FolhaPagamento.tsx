
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { PayrollList } from '@/components/payroll/PayrollList';
import { EmployeesList } from '@/components/payroll/EmployeesList';
import { PayrollReports } from '@/components/payroll/PayrollReports';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const FolhaPagamento = () => {
  const { requireAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("folhas");

  // Verify authentication before rendering
  const { authenticated, loading } = requireAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!authenticated) {
    return null; // Will be redirected by requireAuth
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Folha de Pagamento</h2>
          <p className="text-muted-foreground mt-2">
            Gestão completa de folha de pagamento para seus clientes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="folhas">Folhas</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="folhas" className="mt-0">
              <PayrollList />
            </TabsContent>
            
            <TabsContent value="funcionarios" className="mt-0">
              <EmployeesList />
            </TabsContent>
            
            <TabsContent value="relatorios" className="mt-0">
              <PayrollReports />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FolhaPagamento;
