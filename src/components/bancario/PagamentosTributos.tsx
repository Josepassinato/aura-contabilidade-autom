
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { pagarTributo, PagamentoTributo, obterConfiguracaoBancaria } from "@/services/bancario/automacaoBancaria";
import { logger } from "@/utils/logger";

interface PagamentosTributosProps {
  bancoSelecionado: string;
}

export function PagamentosTributos({ bancoSelecionado }: PagamentosTributosProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formTributo, setFormTributo] = useState({
    tipoTributo: "DARF",
    valor: "",
    codigoBarras: "",
    dataVencimento: "",
    contribuinte: "",
    documento: ""
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

  const handlePagamentoTributo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificarConfiguracao()) return;
    
    try {
      if (!formTributo.valor || !formTributo.codigoBarras || !formTributo.dataVencimento) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      const dadosPagamento: Omit<PagamentoTributo, 'id' | 'status' | 'dataPagamento' | 'comprovante'> = {
        tipoTributo: formTributo.tipoTributo as any,
        valorPrincipal: parseFloat(formTributo.valor),
        valorTotal: parseFloat(formTributo.valor),
        codigoBarras: formTributo.codigoBarras,
        dataVencimento: formTributo.dataVencimento,
        contribuinte: {
          nome: formTributo.contribuinte,
          documento: formTributo.documento
        }
      };
      
      const pagamento = await pagarTributo(dadosPagamento);
      logger.info("Pagamento de tributo realizado:", pagamento, "PagamentosTributos");
      
      // Limpar formulário
      setFormTributo({
        tipoTributo: "DARF",
        valor: "",
        codigoBarras: "",
        dataVencimento: "",
        contribuinte: "",
        documento: ""
      });
      
    } catch (error) {
      logger.error("Erro ao pagar tributo:", error, "PagamentosTributos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento de Tributos</CardTitle>
        <CardDescription>
          Pague guias de tributos federais, estaduais e municipais automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePagamentoTributo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoTributo">Tipo de Tributo</Label>
              <Select
                value={formTributo.tipoTributo}
                onValueChange={(value) => setFormTributo({...formTributo, tipoTributo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DARF">DARF</SelectItem>
                  <SelectItem value="GPS">GPS</SelectItem>
                  <SelectItem value="DAS">DAS</SelectItem>
                  <SelectItem value="FGTS">FGTS</SelectItem>
                  <SelectItem value="IPTU">IPTU</SelectItem>
                  <SelectItem value="IPVA">IPVA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valorTributo">Valor Total (R$)</Label>
              <Input
                id="valorTributo"
                placeholder="0,00"
                value={formTributo.valor}
                onChange={(e) => setFormTributo({...formTributo, valor: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoBarras">Código de Barras</Label>
            <Input
              id="codigoBarras"
              placeholder="Código de barras da guia de pagamento"
              value={formTributo.codigoBarras}
              onChange={(e) => setFormTributo({...formTributo, codigoBarras: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={formTributo.dataVencimento}
                onChange={(e) => setFormTributo({...formTributo, dataVencimento: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contribuinte">Nome do Contribuinte</Label>
              <Input
                id="contribuinte"
                placeholder="Nome completo ou razão social"
                value={formTributo.contribuinte}
                onChange={(e) => setFormTributo({...formTributo, contribuinte: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentoContribuinte">CPF/CNPJ do Contribuinte</Label>
            <Input
              id="documentoContribuinte"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={formTributo.documento}
              onChange={(e) => setFormTributo({...formTributo, documento: e.target.value})}
            />
          </div>

          <Button 
            className="w-full" 
            type="submit"
            disabled={isLoading || !bancoSelecionado}
          >
            {isLoading ? "Processando..." : "Pagar Tributo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
