
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { realizarPagamentoAvancado, PagamentoResponse } from "@/services/bancario/openBankingService";
import { TipoImposto, ResultadoCalculo } from "@/services/fiscal/types";
import { publicarEvento } from "@/services/fiscal/mensageria/eventoProcessor";

export const usePagamentoImposto = (cnpj: string, periodo: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pagamentoStatus, setPagamentoStatus] = useState<Record<string, PagamentoResponse | null>>({});
  const selectedBanco = localStorage.getItem("banco-selecionado") || "";

  const handlePagamento = async (tipo: TipoImposto, resultado: ResultadoCalculo) => {
    if (!selectedBanco) {
      toast({
        title: "Banco não configurado",
        description: "Configure um banco nas configurações antes de pagar impostos.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Gerar código de barras simulado se não existir
      let codigoBarras = "";
      if (resultado.codigoReceita) {
        const randomCode = Math.floor(10000000000 + Math.random() * 90000000000);
        codigoBarras = `85810000${randomCode}-5 ${resultado.codigoReceita}0065${randomCode % 1000}-1 ${resultado.dataVencimento.replace(/-/g, "")}2-6 ${cnpj.substring(0,8)}55-9`;
      } else {
        codigoBarras = `846700000017 351501536598 430620226015 506181270322`;
      }
      
      // Configuração bancária simulada
      const bankCredentials = {
        banco: selectedBanco,
        agencia: localStorage.getItem(`banco-${selectedBanco}-agencia`) || "",
        conta: localStorage.getItem(`banco-${selectedBanco}-conta`) || "",
        tipoConta: "corrente" as const
      };
      
      // Requisição de pagamento
      const response = await realizarPagamentoAvancado({
        credentials: bankCredentials,
        codigoBarras,
        valor: resultado.valorFinal as number,
        dataVencimento: resultado.dataVencimento,
        dataPagamento: new Date().toISOString().split('T')[0],
        descricao: `Pagamento de ${tipo} - Período ${periodo}`,
        tipo: (resultado.codigoReceita === 'DAS' ? 'DAS' : 'DARF') as any
      });
      
      // Atualiza status do pagamento
      setPagamentoStatus(prev => ({
        ...prev,
        [tipo]: response
      }));
      
      if (response.sucesso) {
        toast({
          title: "Pagamento realizado",
          description: `${tipo} no valor de R$ ${resultado.valorFinal.toFixed(2)} pago com sucesso.`
        });
        
        // Publicar evento de pagamento
        publicarEvento('pagamento.executed', {
          tipoImposto: tipo,
          valor: resultado.valorFinal,
          sucesso: true,
          dataVencimento: resultado.dataVencimento,
          dataPagamento: new Date().toISOString().split('T')[0],
          cnpj: cnpj
        });
      } else {
        toast({
          title: "Problema no pagamento",
          description: response.mensagem || "Ocorreu um problema ao processar o pagamento.",
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePagamento,
    pagamentoStatus,
    isLoading,
    setIsLoading,
    selectedBanco
  };
};
