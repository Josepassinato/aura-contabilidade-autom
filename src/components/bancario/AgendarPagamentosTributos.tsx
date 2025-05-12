
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { agendarPagamentosEmLote } from "@/services/bancario/openBankingService";
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";

interface AgendarPagamentosTributosProps {
  bancoSelecionado: string;
}

interface PagamentoItem {
  codigoBarras: string;
  valor: string;
  dataVencimento: string;
  dataPagamento: string;
  descricao: string;
  tipo: 'DARF' | 'GPS' | 'DAS' | 'FGTS' | 'IPTU' | 'IPVA' | 'Boleto';
}

export function AgendarPagamentosTributos({ bancoSelecionado }: AgendarPagamentosTributosProps) {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Agendamento em Lote de Tributos e Boletos
          </CardTitle>
          <CardDescription>
            Configure múltiplos pagamentos para serem processados em lote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importacao">Importar de CSV ou JSON (opcional)</Label>
            <Textarea
              id="importacao"
              placeholder="Cole dados no formato JSON ou CSV (código;valor;vencimento;tipo;descrição)"
              value={loteImportado}
              onChange={(e) => setLoteImportado(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImportarLote}
              >
                Importar Dados
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Pagamentos</h3>
            <div className="space-y-6">
              {pagamentos.map((pagamento, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Pagamento #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePagamento(index)}
                    >
                      Remover
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`tipo-${index}`}>Tipo</Label>
                      <Select 
                        value={pagamento.tipo}
                        onValueChange={(valor) => handleChangePagamento(index, 'tipo', valor)}
                      >
                        <SelectTrigger id={`tipo-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DARF">DARF</SelectItem>
                          <SelectItem value="GPS">GPS</SelectItem>
                          <SelectItem value="DAS">DAS</SelectItem>
                          <SelectItem value="FGTS">FGTS</SelectItem>
                          <SelectItem value="IPTU">IPTU</SelectItem>
                          <SelectItem value="IPVA">IPVA</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`valor-${index}`}>Valor (R$)</Label>
                      <Input
                        id={`valor-${index}`}
                        type="text"
                        placeholder="0,00"
                        value={pagamento.valor}
                        onChange={(e) => handleChangePagamento(index, 'valor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`codigo-${index}`}>Código de Barras</Label>
                    <Input
                      id={`codigo-${index}`}
                      type="text"
                      placeholder="Insira o código de barras"
                      value={pagamento.codigoBarras}
                      onChange={(e) => handleChangePagamento(index, 'codigoBarras', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`vencimento-${index}`}>Data de Vencimento</Label>
                      <Input
                        id={`vencimento-${index}`}
                        type="date"
                        value={pagamento.dataVencimento}
                        onChange={(e) => handleChangePagamento(index, 'dataVencimento', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`pagamento-${index}`}>Data de Pagamento</Label>
                      <Input
                        id={`pagamento-${index}`}
                        type="date"
                        value={pagamento.dataPagamento}
                        onChange={(e) => handleChangePagamento(index, 'dataPagamento', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`descricao-${index}`}>Descrição (opcional)</Label>
                    <Input
                      id={`descricao-${index}`}
                      type="text"
                      placeholder="Identificação do pagamento"
                      value={pagamento.descricao}
                      onChange={(e) => handleChangePagamento(index, 'descricao', e.target.value)}
                    />
                  </div>
                  
                  {/* Status do resultado para este pagamento */}
                  {resultado && resultado.detalhes.some(d => d.index === index) && (
                    <div className={`p-3 rounded-md text-sm ${
                      resultado.detalhes.find(d => d.index === index)?.sucesso
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {resultado.detalhes.find(d => d.index === index)?.sucesso ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>{resultado.detalhes.find(d => d.index === index)?.mensagem}</span>
                      </div>
                      {resultado.detalhes.find(d => d.index === index)?.idTransacao && (
                        <div className="mt-1 text-xs">
                          ID: {resultado.detalhes.find(d => d.index === index)?.idTransacao}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={handleAddPagamento}
            >
              Adicionar Pagamento
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleAgendar}
            disabled={isLoading || !bancoSelecionado}
          >
            {isLoading ? "Processando..." : "Agendar Pagamentos"}
          </Button>
        </CardFooter>
      </Card>
      
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total de pagamentos</p>
                  <p className="text-2xl font-bold">{resultado.sucessos + resultado.falhas}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Sucesso</p>
                  <p className="text-2xl font-bold text-green-600">{resultado.sucessos}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">Falhas</p>
                  <p className="text-2xl font-bold text-red-600">{resultado.falhas}</p>
                </div>
              </div>
              
              {resultado.sucessos === pagamentos.length ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Todos os pagamentos foram agendados com sucesso!</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-amber-100 text-amber-800 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Alguns pagamentos não puderam ser agendados. Verifique os detalhes acima.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
