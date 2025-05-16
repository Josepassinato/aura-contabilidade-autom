
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { formatPeriod } from '../../hooks/usePayrollGenerator';

interface PayrollHeaderProps {
  payrollData: any;
}

export function PayrollHeader({ payrollData }: PayrollHeaderProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'paid':
        return <Badge variant="default">Pago</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
