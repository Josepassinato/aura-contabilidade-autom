
import React from 'react';
import { Employee } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSubmit: (data: any) => Promise<boolean>;
}

export function EmployeeFormDialog({ 
  open, 
  onOpenChange, 
  employee, 
  onSubmit 
}: EmployeeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Funcionário" : "Adicionar Funcionário"}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Formulário de cadastro de funcionários estará disponível em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
