
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { agendarPagamentosEmLote } from "@/services/bancario/openBankingService";
import { PagamentoItem } from "./ItemPagamento";

export function usePagamentosLote(bancoSelecionado: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [pagamentos, setPagamentos] = useState<PagamentoItem[]>([{
    codigoBarras: "",
    valor: "",
    dataVencimento: "",
    dataPagamento: new Date().toISOString().split('T')[0],
    descricao: "",
    tipo: "DARF"
  }]);
  const [resultado, setResultado] = useState<{
    sucessos: number;
    falhas: number;
    detalhes: Array<{ 
      sucesso: boolean; 
      idTransacao?: string; 
      mensagem?: string;
      index: number;
    }>;
  } | null>(null);
  const [loteImportado, setLoteImportado] = useState("");

  const handleAddPagamento = () => {
    setPagamentos([
      ...pagamentos,
      {
        codigoBarras: "",
        valor: "",
        dataVencimento: "",
        dataPagamento: new Date().toISOString().split('T')[0],
        descricao: "",
        tipo: "DARF"
      }
    ]);
  };

  const handleRemovePagamento = (index: number) => {
    if (pagamentos.length === 1) {
      toast({
        title: "Ação não permitida",
        description: "É necessário manter ao menos um pagamento na lista",
        variant: "destructive"
      });
      return;
    }
    
    setPagamentos(pagamentos.filter((_, i) => i !== index));
  };

  const handleChangePagamento = (index: number, campo: string, valor: string) => {
    const novosPagamentos = [...pagamentos];
    novosPagamentos[index] = {
      ...novosPagamentos[index],
      [campo]: valor
    };
    setPagamentos(novosPagamentos);
  };

  const handleAgendar = async () => {
    // Validação dos campos
    const camposInvalidos = pagamentos.some(p => 
      !p.codigoBarras || !p.valor || !p.dataVencimento || !p.dataPagamento || !p.tipo
    );
    
    if (camposInvalidos) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios em todos os pagamentos",
        variant: "destructive"
      });
      return;
    }
    
    if (!bancoSelecionado) {
      toast({
        title: "Banco não configurado",
        description: "Configure um banco nas configurações antes de agendar pagamentos",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setResultado(null);
      
      // Configuração bancária simulada
      const bankCredentials = {
        banco: bancoSelecionado,
        agencia: localStorage.getItem(`banco-${bancoSelecionado}-agencia`) || "",
        conta: localStorage.getItem(`banco-${bancoSelecionado}-conta`) || "",
        tipoConta: "corrente" as const
      };
      
      // Formatar pagamentos
      const pagamentosFormatados = pagamentos.map(p => ({
        ...p,
        valor: Number(p.valor)
      }));
      
      // Agendar pagamentos
      const result = await agendarPagamentosEmLote(bankCredentials, pagamentosFormatados as any);
      setResultado(result);
      
      // Exibir resultado
      if (result.sucessos === pagamentos.length) {
        toast({
          title: "Agendamento concluído",
          description: `Todos os ${result.sucessos} pagamentos foram agendados com sucesso`
        });
      } else {
        toast({
          title: "Agendamento com alertas",
          description: `${result.sucessos} pagamentos agendados com sucesso e ${result.falhas} falhas`,
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Erro no agendamento",
        description: error.message || "Ocorreu um erro ao agendar os pagamentos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportarLote = () => {
    try {
      if (!loteImportado.trim()) {
        toast({
          title: "Dados inválidos",
          description: "Informe os dados para importação",
          variant: "destructive"
        });
        return;
      }
      
      // Tenta fazer o parse do JSON
      let dados: PagamentoItem[];
      try {
        dados = JSON.parse(loteImportado);
      } catch (e) {
        // Tenta o formato CSV simples
        dados = loteImportado
          .split('\n')
          .filter(linha => linha.trim())
          .map(linha => {
            const [codigoBarras, valor, dataVencimento, tipo, descricao] = linha.split(';');
            return {
              codigoBarras: codigoBarras?.trim() || "",
              valor: valor?.trim() || "0",
              dataVencimento: dataVencimento?.trim() || new Date().toISOString().split('T')[0],
              dataPagamento: new Date().toISOString().split('T')[0],
              tipo: (tipo?.trim() as any) || "Boleto",
              descricao: descricao?.trim() || ""
            };
          });
      }
      
      if (!Array.isArray(dados) || !dados.length) {
        throw new Error("Formato de dados inválido");
      }
      
      // Atualiza os pagamentos
      setPagamentos(dados);
      
      toast({
        title: "Importação concluída",
        description: `${dados.length} pagamentos importados com sucesso`
      });
      
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message || "Formato de dados inválido",
        variant: "destructive"
      });
    }
  };

  return {
    isLoading,
    pagamentos,
    resultado,
    loteImportado,
    setLoteImportado,
    handleAddPagamento,
    handleRemovePagamento,
    handleChangePagamento,
    handleAgendar,
    handleImportarLote
  };
}
