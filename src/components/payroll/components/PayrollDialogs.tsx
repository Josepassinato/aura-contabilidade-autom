
import React from 'react';
import { PayrollEntry } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PayrollGenerator } from '../PayrollGenerator';
import { PayrollDetails } from '../PayrollDetails';

interface PayrollDialogsProps {
  isGeneratorOpen: boolean;
  onCloseGenerator: () => void;
  isDetailsOpen: boolean;
  onCloseDetails: () => void;
  selectedClientId: string | null;
  selectedPayroll: PayrollEntry | null;
  onPayrollCreated: () => void;
}

export function PayrollDialogs({
  isGeneratorOpen,
  onCloseGenerator,
  isDetailsOpen,
  onCloseDetails,
  selectedClientId,
  selectedPayroll,
  onPayrollCreated
}: PayrollDialogsProps) {
  return (
    <>
      <Dialog open={isGeneratorOpen} onOpenChange={onCloseGenerator}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Gerar Nova Folha de Pagamento</DialogTitle>
          </DialogHeader>
          <PayrollGenerator
            clientId={selectedClientId}
            onPayrollCreated={onPayrollCreated}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailsOpen} onOpenChange={onCloseDetails}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Folha de Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <PayrollDetails payrollId={selectedPayroll.id} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
