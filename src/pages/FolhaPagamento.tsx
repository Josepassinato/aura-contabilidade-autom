
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayrollList } from '@/components/payroll/PayrollList';
import { EmployeesList } from '@/components/payroll/EmployeesList';
import { PayrollReports } from '@/components/payroll/PayrollReports';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const FolhaPagamento = () => {
  const [activeTab, setActiveTab] = useState("folhas");
  const [isLoading, setIsLoading] = useState(true);

  // Simple loading state with automatic timeout to prevent freezing
  useEffect(() => {
    console.log("FolhaPagamento component mounted");
    
    // Use a timeout to prevent infinite loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando informações da folha de pagamento...</p>
          </div>
        </div>
      </DashboardLayout>
    );
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
