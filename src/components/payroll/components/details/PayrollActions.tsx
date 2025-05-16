
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileCog, CheckCircle } from 'lucide-react';

interface PayrollActionsProps {
  payrollData: any;
  onUpdateStatus: (newStatus: string) => void;
  isUpdating: boolean;
}

export function PayrollActions({ payrollData, onUpdateStatus, isUpdating }: PayrollActionsProps) {
  if (payrollData.status === 'paid') {
    return null;
  }
  
  return (
    <div className="flex justify-end gap-2 pt-4">
      {payrollData.status === 'draft' && (
        <Button 
          variant="outline"
          onClick={() => onUpdateStatus('processing')}
          disabled={isUpdating}
        >
          <FileCog className="h-4 w-4 mr-2" />
          Processar
        </Button>
      )}
      
      {payrollData.status === 'processing' && (
        <Button 
          variant="outline"
          className="bg-green-50 border-green-200 hover:bg-green-100 text-green-800"
          onClick={() => onUpdateStatus('approved')}
          disabled={isUpdating}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprovar
        </Button>
      )}
      
      {payrollData.status === 'approved' && (
        <Button 
          variant="default"
          onClick={() => onUpdateStatus('paid')}
          disabled={isUpdating}
        >
          Registrar Pagamento
        </Button>
      )}
    </div>
  );
}
