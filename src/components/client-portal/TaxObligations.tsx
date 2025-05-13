
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface TaxObligationsProps {
  clientId: string;
}

export const TaxObligations = ({ clientId }: TaxObligationsProps) => {
  const [obligations, setObligations] = useState([
    { id: 1, name: 'DARF PIS/COFINS', dueDate: '25/05/2025', amount: 'R$ 4.271,61', status: 'pendente' },
    { id: 2, name: 'DARF IRPJ', dueDate: '30/05/2025', amount: 'R$ 6.814,82', status: 'pendente' },
    { id: 3, name: 'GFIP', dueDate: '20/05/2025', amount: 'R$ 1.728,40', status: 'pendente' }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Obrigações Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {obligations.map(obligation => (
            <div key={obligation.id} className="flex justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">{obligation.name}</p>
                <p className="text-sm text-muted-foreground">Vencimento: {obligation.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{obligation.amount}</p>
                <p className={`text-xs px-2 py-1 rounded-full inline-block 
                  ${obligation.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                    obligation.status === 'pago' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {obligation.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
