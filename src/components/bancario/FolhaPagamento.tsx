
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function FolhaPagamentoAutomacaoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automação de Folha de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidade de automação de folha de pagamento em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
}

// Export with original name for backward compatibility
export { FolhaPagamentoAutomacaoCard as FolhaPagamento };
