
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { PayrollList } from '@/components/payroll/PayrollList';
import { EmployeesList } from '@/components/payroll/EmployeesList';
import { PayrollReports } from '@/components/payroll/PayrollReports';

const FolhaPagamento = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("folhas");

  return (
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
          <TabsContent value="folhas">
            <PayrollList />
          </TabsContent>
          
          <TabsContent value="funcionarios">
            <EmployeesList />
          </TabsContent>
          
          <TabsContent value="relatorios">
            <PayrollReports />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default FolhaPagamento;
