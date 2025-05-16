
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { PayrollList } from '@/components/payroll/PayrollList';
import { EmployeesList } from '@/components/payroll/EmployeesList';
import { PayrollReports } from '@/components/payroll/PayrollReports';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/hooks/use-toast';

const FolhaPagamento = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("folhas");

  // Simple loading state instead of using requireAuth
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>;
  }
  
  // Simple check for authentication
  if (!isAuthenticated) {
    // We'll be redirected by the ProtectedRoute in routes.tsx
    return null;
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
            <TabsContent value="folhas" className="mt-0 space-y-4">
              <PayrollList />
            </TabsContent>
            
            <TabsContent value="funcionarios" className="mt-0 space-y-4">
              <EmployeesList />
            </TabsContent>
            
            <TabsContent value="relatorios" className="mt-0 space-y-4">
              <PayrollReports />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FolhaPagamento;
