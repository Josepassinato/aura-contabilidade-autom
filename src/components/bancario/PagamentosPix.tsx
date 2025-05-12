
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { realizarPagamentoPIX, agendarPagamento, Transacao } from "@/services/bancario/automacaoBancaria";
import { obterConfiguracaoBancaria } from "@/services/bancario/automacaoBancaria";

interface PagamentosPixProps {
  bancoSelecionado: string;
}

export function PagamentosPix({ bancoSelecionado }: PagamentosPixProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formPagamento, setFormPagamento] = useState({
    valor: "",
    favorecido: "",
    documento: "",
    descricao: "",
    chavePix: "",
    dataAgendamento: ""
  });

  const verificarConfiguracao = () => {
    const config = obterConfiguracaoBancaria(bancoSelecionado);
    if (!config) {
      toast({
        title: "Configuração bancária ausente",
        description: "Configure as credenciais bancárias nas configurações antes de utilizar esta funcionalidade.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePagamentoPIX = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificarConfiguracao()) return;
    
    try {
      if (!formPagamento.valor || !formPagamento.favorecido || !formPagamento.documento || !formPagamento.chavePix) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      const dadosPagamento = {
        valor: parseFloat(formPagamento.valor),
        descricao: formPagamento.descricao || "Pagamento via PIX",
        favorecido: {
          nome: formPagamento.favorecido,
          documento: formPagamento.documento,
          chavePIX: formPagamento.chavePix
        },
        dataAgendamento: formPagamento.dataAgendamento || undefined
      };
      
      let transacao: Transacao;
      
      if (formPagamento.dataAgendamento) {
        transacao = await agendarPagamento(
          { ...dadosPagamento, tipoTransacao: 'PIX' },
          formPagamento.dataAgendamento
        );
      } else {
        transacao = await realizarPagamentoPIX(dadosPagamento);
      }
      
      console.log("Transação realizada:", transacao);
      
      // Limpar formulário
      setFormPagamento({
        valor: "",
        favorecido: "",
        documento: "",
        descricao: "",
        chavePix: "",
        dataAgendamento: ""
      });
      
    } catch (error) {
      console.error("Erro ao realizar pagamento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via PIX</CardTitle>
        <CardDescription>
          Realize pagamentos automáticos para fornecedores, colaboradores ou clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePagamentoPIX} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                placeholder="0,00"
                value={formPagamento.valor}
                onChange={(e) => setFormPagamento({...formPagamento, valor: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chavePix">Chave PIX</Label>
              <Input
                id="chavePix"
                placeholder="CPF, CNPJ, E-mail ou Chave Aleatória"
                value={formPagamento.chavePix}
                onChange={(e) => setFormPagamento({...formPagamento, chavePix: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="favorecido">Nome do Favorecido</Label>
              <Input
                id="favorecido"
                placeholder="Nome completo ou razão social"
                value={formPagamento.favorecido}
                onChange={(e) => setFormPagamento({...formPagamento, favorecido: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documento">CPF/CNPJ</Label>
              <Input
                id="documento"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={formPagamento.documento}
                onChange={(e) => setFormPagamento({...formPagamento, documento: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder="Descrição do pagamento"
                value={formPagamento.descricao}
                onChange={(e) => setFormPagamento({...formPagamento, descricao: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataAgendamento">Data de Agendamento (opcional)</Label>
              <Input
                id="dataAgendamento"
                type="date"
                value={formPagamento.dataAgendamento}
                onChange={(e) => setFormPagamento({...formPagamento, dataAgendamento: e.target.value})}
              />
            </div>
          </div>

          <Button 
            className="w-full" 
            type="submit"
            disabled={isLoading || !bancoSelecionado}
          >
            {isLoading ? "Processando..." : formPagamento.dataAgendamento ? "Agendar Pagamento" : "Pagar Agora"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
