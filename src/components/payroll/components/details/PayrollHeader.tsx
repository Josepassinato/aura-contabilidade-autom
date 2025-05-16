
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { formatPeriod, getStatusBadge } from '../../utils/payrollFormatters';

interface PayrollHeaderProps {
  payrollData: any;
}

export function PayrollHeader({ payrollData }: PayrollHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">
          Folha de Pagamento - {formatPeriod(payrollData.period)}
        </h3>
        <div className="text-sm text-muted-foreground">
          Gerada em {new Date(payrollData.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(payrollData.status)}
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
