
import React, { useState } from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { PayrollTable } from './components/PayrollTable';
import { PayrollHeader } from './components/PayrollHeader';
import { PayrollFilter } from './components/PayrollFilter';
import { PayrollDialogs } from './components/PayrollDialogs';
import { usePayrollData } from './hooks/usePayrollData';

export function PayrollList() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  
  // Use our custom hook for payroll data with error handling
  const { payrolls, isLoading, refreshPayrolls } = usePayrollData(selectedClientId, period);
  
  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    
    // If a client is directly selected, add to client names map
    if (client.id) {
      setClientNames(prev => ({
        ...prev,
        [client.id]: client.name
      }));
    }
  };
  
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };
  
  const handlePayrollCreated = () => {
    setIsGeneratorOpen(false);
    refreshPayrolls();
  };
  
  const handleViewPayroll = (payroll: PayrollEntry) => {
    setSelectedPayroll(payroll);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PayrollHeader 
        onCreateNew={() => setIsGeneratorOpen(true)} 
      />
      
      <PayrollFilter 
        selectedClientId={selectedClientId}
        onClientSelect={handleClientSelect}
        period={period}
        onPeriodChange={handlePeriodChange}
        onRefresh={refreshPayrolls}
      />
      
      <PayrollTable 
        payrolls={payrolls}
        isLoading={isLoading}
        selectedClientId={selectedClientId}
        onViewPayroll={handleViewPayroll}
        clientNames={clientNames}
      />
      
      <PayrollDialogs 
        isGeneratorOpen={isGeneratorOpen}
        onCloseGenerator={() => setIsGeneratorOpen(false)}
        isDetailsOpen={isDetailsOpen}
        onCloseDetails={() => setIsDetailsOpen(false)}
        selectedClientId={selectedClientId}
        selectedPayroll={selectedPayroll}
        onPayrollCreated={handlePayrollCreated}
      />
    </div>
  );
}
