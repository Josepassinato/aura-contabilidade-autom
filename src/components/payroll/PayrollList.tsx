
import React, { useState, useEffect } from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { PayrollTable } from './components/PayrollTable';
import { PayrollHeader } from './components/PayrollHeader';
import { PayrollFilter } from './components/PayrollFilter';
import { PayrollDialogs } from './components/PayrollDialogs';
import { usePayrollData } from './hooks/usePayrollData';
import { fetchClientById } from '@/services/supabase/clientsService';

export function PayrollList() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  
  // Use our custom hook for payroll data
  const { payrolls, isLoading, refreshPayrolls } = usePayrollData(selectedClientId, period);
  
  // Fetch client names for all payrolls
  useEffect(() => {
    const fetchClientNames = async () => {
      if (!payrolls.length) return;
      
      // Get unique client IDs from payrolls
      const uniqueClientIds = [...new Set(payrolls.map(p => p.client_id))];
      
      // Fetch client names in parallel
      const results = await Promise.all(
        uniqueClientIds.map(async (id) => {
          const client = await fetchClientById(id);
          return { id, name: client?.name || `Cliente ${id.slice(0, 5)}...` };
        })
      );
      
      // Create a map of client ID to client name
      const namesMap = results.reduce((acc, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {} as Record<string, string>);
      
      setClientNames(namesMap);
    };
    
    fetchClientNames();
  }, [payrolls]);
  
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
