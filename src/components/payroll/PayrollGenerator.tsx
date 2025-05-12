
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { PayrollPeriodSelector } from './components/PayrollPeriodSelector';
import { PayrollEmployeesTable } from './components/PayrollEmployeesTable';
import { usePayrollGenerator } from './hooks/usePayrollGenerator';

interface PayrollGeneratorProps {
  clientId: string | null;
  onPayrollCreated: () => void;
}

export function PayrollGenerator({ clientId: initialClientId, onPayrollCreated }: PayrollGeneratorProps) {
  const [clientId, setClientId] = useState<string | null>(initialClientId);
  
  const {
    employees,
    isLoading,
    selectedEmployees,
    period,
    isGenerating,
    setPeriod,
    toggleEmployeeSelection,
    toggleAllEmployees,
    calculatePayroll
  } = usePayrollGenerator(clientId, onPayrollCreated);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setClientId(client.id);
  };
  
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector 
            defaultValue={clientId || ""} 
            onClientSelect={handleClientSelect} 
          />
        </div>
        
        <PayrollPeriodSelector 
          period={period}
          onChange={handlePeriodChange}
        />
      </div>
      
      <div className="border rounded-md">
        {!clientId ? (
          <div className="py-8 text-center">
            Selecione um cliente para gerar a folha de pagamento.
          </div>
        ) : (
          <PayrollEmployeesTable
            employees={employees}
            isLoading={isLoading}
            selectedEmployees={selectedEmployees}
            toggleEmployeeSelection={toggleEmployeeSelection}
            toggleAllEmployees={toggleAllEmployees}
          />
        )}
      </div>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onPayrollCreated}>
          Cancelar
        </Button>
        <Button 
          onClick={calculatePayroll} 
          disabled={!clientId || selectedEmployees.length === 0 || isGenerating}
        >
          {isGenerating ? "Gerando..." : "Gerar Folha de Pagamento"}
        </Button>
      </div>
    </div>
  );
}
