
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmployeesHeaderProps {
  onAddEmployee: () => void;
}

export function EmployeesHeader({ onAddEmployee }: EmployeesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold">Funcionários</h3>
      <Button onClick={onAddEmployee}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Funcionário
      </Button>
    </div>
  );
}
