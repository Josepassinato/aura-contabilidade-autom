
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileCog, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PayrollActionsProps {
  payrollData: any;
  onUpdateStatus: (newStatus: string) => void;
  isUpdating: boolean;
}

export function PayrollActions({ payrollData, onUpdateStatus, isUpdating }: PayrollActionsProps) {
  const { toast } = useToast();

  const handleUpdateStatus = (newStatus: string) => {
    onUpdateStatus(newStatus);
    
    // Show toast notification
    const statusMessages = {
      'processing': 'Folha de pagamento enviada para processamento',
      'approved': 'Folha de pagamento aprovada com sucesso',
      'paid': 'Pagamento registrado com sucesso'
    };
    
    toast({
      title: statusMessages[newStatus as keyof typeof statusMessages] || 'Status atualizado',
      description: `A folha de pagamento foi atualizada para ${newStatus}`,
      variant: "default",
    });
  };
  
  if (payrollData.status === 'paid') {
    return null;
  }
  
  return (
    <div className="flex justify-end gap-2 pt-4">
      {payrollData.status === 'draft' && (
        <Button 
          variant="outline"
          onClick={() => handleUpdateStatus('processing')}
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
          onClick={() => handleUpdateStatus('approved')}
          disabled={isUpdating}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprovar
        </Button>
      )}
      
      {payrollData.status === 'approved' && (
        <Button 
          variant="default"
          onClick={() => handleUpdateStatus('paid')}
          disabled={isUpdating}
        >
          Registrar Pagamento
        </Button>
      )}
    </div>
  );
}
