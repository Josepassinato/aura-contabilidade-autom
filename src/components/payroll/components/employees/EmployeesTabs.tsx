
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmployeesTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function EmployeesTabs({ activeTab, onTabChange }: EmployeesTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="ativos">Funcionários Ativos</TabsTrigger>
        <TabsTrigger value="inativos">Funcionários Inativos</TabsTrigger>
        <TabsTrigger value="todos">Todos</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
