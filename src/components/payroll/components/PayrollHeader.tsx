
import React from 'react';
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";

interface PayrollHeaderProps {
  onCreateNew: () => void;
}

export function PayrollHeader({ onCreateNew }: PayrollHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold">Folhas de Pagamento</h3>
      <Button onClick={onCreateNew}>
        <FilePlus className="mr-2 h-4 w-4" />
        Nova Folha
      </Button>
    </div>
  );
}
