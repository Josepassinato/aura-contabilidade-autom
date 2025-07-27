
import React, { useState, useEffect } from 'react';
import { PayrollEntry } from '@/lib/supabase';
import { PayrollTable } from './components/PayrollTable';
import { PayrollHeader } from './components/PayrollHeader';
import { PayrollFilter } from './components/PayrollFilter';
import { PayrollDialogs } from './components/PayrollDialogs';
import { usePayrollData } from './hooks/usePayrollData';
import { toast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";

export function PayrollList() {
  logger.debug("PayrollList component rendering", undefined, "PayrollList");

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [clientNames, setClientNames] = useState<Record<string, string>>({
    // Default mock client names to prevent UI issues
    'client-123': 'Empresa ABC Ltda',
    'client-456': 'XYZ Comércio S.A.'
  });
  
  // Initialize with safer defaults
  useEffect(() => {
    logger.debug("PayrollList component mounted", undefined, "PayrollList");
  }, []);
  
  // Use our custom hook for payroll data with error handling
  const { payrolls, isLoading, refreshPayrolls } = usePayrollData(selectedClientId, period);
  
  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    logger.debug("Client selected:", client, "PayrollList");
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
    logger.debug("Period changed:", e.target.value, "PayrollList");
    setPeriod(e.target.value);
  };
  
  const handlePayrollCreated = () => {
    setIsGeneratorOpen(false);
    refreshPayrolls();
    toast({
      title: "Folha criada",
      description: "A folha de pagamento foi criada com sucesso",
    });
  };
  
  const handleViewPayroll = (payroll: PayrollEntry) => {
    logger.debug("View payroll:", payroll, "PayrollList");
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
        payrolls={payrolls || []}
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
