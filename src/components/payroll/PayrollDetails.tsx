
import React from 'react';
import { usePayrollDetails } from './hooks/usePayrollDetails';
import { PayrollHeader } from './components/details/PayrollHeader';
import { EmployeeInfo } from './components/details/EmployeeInfo';
import { PayrollSummary } from './components/details/PayrollSummary';
import { PayrollDetails as PayrollDetailsComponent } from './components/details/PayrollDetails';
import { PayrollActions } from './components/details/PayrollActions';

interface PayrollDetailsProps {
  payrollId: string;
}

export function PayrollDetails({ payrollId }: PayrollDetailsProps) {
  const {
    payrollData,
    employeeData,
    deductions,
    benefits,
    isLoading,
    isUpdating,
    handleUpdateStatus
  } = usePayrollDetails(payrollId);

  if (isLoading) {
    return <div className="py-8 text-center">Carregando detalhes da folha de pagamento...</div>;
  }
  
  if (!payrollData) {
    return <div className="py-8 text-center">Dados não encontrados.</div>;
  }
  
  return (
    <div className="space-y-6">
      <PayrollHeader payrollData={payrollData} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmployeeInfo employeeData={employeeData} />
        <PayrollSummary payrollData={payrollData} />
      </div>
      
      <PayrollDetailsComponent 
        payrollData={payrollData}
        benefits={benefits}
        deductions={deductions}
      />
      
      <PayrollActions 
        payrollData={payrollData}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
}
