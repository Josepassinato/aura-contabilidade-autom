
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PixPaymentForm } from "./PagamentosPix/PixPaymentForm";
import { PixPaymentHistory } from "./PagamentosPix/PixPaymentHistory";

interface PagamentosPixProps {
  bancoSelecionado: string;
  clientId: string;
}

export function PagamentosPix({ bancoSelecionado, clientId }: PagamentosPixProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Função para atualizar o histórico após um pagamento bem-sucedido
  const handlePaymentSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <Tabs defaultValue="novo" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="novo">Novo Pagamento</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
      </TabsList>
      
      <TabsContent value="novo">
        <PixPaymentForm 
          clientId={clientId}
          onSuccess={handlePaymentSuccess}
        />
      </TabsContent>
      
      <TabsContent value="historico">
        <PixPaymentHistory 
          clientId={clientId}
          refreshTrigger={refreshTrigger}
        />
      </TabsContent>
    </Tabs>
  );
}
