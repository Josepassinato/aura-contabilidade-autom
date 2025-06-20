
import React, { useState } from 'react';
import { Employee } from '@/lib/supabase';
import { useEmployeesList } from './hooks/useEmployeesList';
import { EmployeesHeader } from './components/employees/EmployeesHeader';
import { EmployeesTabs } from './components/employees/EmployeesTabs';
import { EmployeesContent } from './components/employees/EmployeesContent';
import { EmployeesUploadTab } from './components/employees/EmployeesUploadTab';
import { EmployeeFormDialog } from './components/employees/EmployeeFormDialog';
import { Button } from "@/components/ui/button";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EmployeesList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("lista");
  const [clientName, setClientName] = useState<string>('');
  
  const { 
    employees,
    selectedClientId,
    activeTab,
    isLoading,
    setSelectedClientId,
    setActiveTab,
    handleClientSelect,
    handleFormSubmit
  } = useEmployeesList();
  
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleClientSelectWithName = (client: { id: string, name: string }) => {
    handleClientSelect(client);
    setClientName(client.name);
  };
  
  return (
    <div className="space-y-6">
      <EmployeesHeader onAddEmployee={handleAddEmployee} />
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector onClientSelect={handleClientSelectWithName} />
        </div>
        
        <div className="w-full md:w-1/2">
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>
      
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista de Funcionários</TabsTrigger>
          <TabsTrigger value="upload">Upload XML</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-4">
          <EmployeesTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <EmployeesContent 
            employees={employees}
            isLoading={isLoading}
            selectedClientId={selectedClientId}
            activeTab={activeTab}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
          />
        </TabsContent>
        
        <TabsContent value="upload">
          <EmployeesUploadTab 
            selectedClientId={selectedClientId}
            clientName={clientName}
            onUploadComplete={() => console.log('Upload concluído')}
          />
        </TabsContent>
      </Tabs>
      
      <EmployeeFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        employee={editingEmployee}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

export default EmployeesList;
