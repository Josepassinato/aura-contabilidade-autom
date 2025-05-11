
import React, { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calcularImposto,
  TipoImposto,
  ParametrosCalculo,
  ResultadoCalculo,
  gerarDARF
} from "@/services/fiscal/calculoFiscal";

export function CalculadoraFiscal() {
  const [cnpj, setCnpj] = useState("");
  const [valor, setValor] = useState("");
  const [tipoImposto, setTipoImposto] = useState<TipoImposto>("IRPJ");
  const [regimeTributario, setRegimeTributario] = useState<'Simples' | 'LucroPresumido' | 'LucroReal'>('LucroPresumido');
  const [periodo, setPeriodo] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null);

  // Formata CNPJ enquanto digita
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 14) {
      // Formata como XX.XXX.XXX/XXXX-XX
      value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
    }
    
    setCnpj(value);
  };

  // Formata valores monetários enquanto digita
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Converte para formato decimal (ex: 1000 -> 10.00)
    if (value.length > 0) {
      const valorNumerico = parseInt(value) / 100;
      setValor(valorNumerico.toFixed(2));
    } else {
      setValor("");
    }
  };

  // Calcula o imposto com base nos parâmetros informados
  const handleCalcular = async () => {
    try {
      if (!cnpj || !valor || parseFloat(valor) <= 0) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setCodigoBarras(null);

      const params: ParametrosCalculo = {
        valor: parseFloat(valor),
        periodo,
        cnpj: cnpj.replace(/\D/g, ''),
        regimeTributario,
        deducoes: 0, // Poderia ser um campo adicional no formulário
      };

      const resultadoCalculo = await calcularImposto(tipoImposto, params);
      
      setResultado(resultadoCalculo);

      toast({
        title: "Cálculo realizado",
        description: `O valor calculado de ${tipoImposto} é R$ ${resultadoCalculo.valorFinal.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Erro ao calcular imposto:", error);
      toast({
        title: "Erro no cálculo",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao calcular o imposto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gera DARF para o resultado do cálculo
  const handleGerarDARF = async () => {
    try {
      if (!resultado) {
        toast({
          title: "Realize o cálculo primeiro",
          description: "É necessário calcular o imposto antes de gerar o DARF",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      const barCode = await gerarDARF(tipoImposto, resultado, cnpj.replace(/\D/g, ''));
      setCodigoBarras(barCode);

      toast({
        title: "DARF gerado com sucesso",
        description: "O código de barras para pagamento foi gerado",
      });
    } catch (error) {
      console.error("Erro ao gerar DARF:", error);
      toast({
        title: "Erro ao gerar DARF",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o DARF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora Fiscal</CardTitle>
        <CardDescription>
          Calcule impostos e gere guias de pagamento automaticamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCnpjChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodo">Período de Apuração</Label>
            <Input
              id="periodo"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoImposto">Tipo de Imposto</Label>
            <Select
              value={tipoImposto}
              onValueChange={(value) => setTipoImposto(value as TipoImposto)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o imposto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IRPJ">IRPJ</SelectItem>
                <SelectItem value="CSLL">CSLL</SelectItem>
                <SelectItem value="PIS">PIS</SelectItem>
                <SelectItem value="COFINS">COFINS</SelectItem>
                <SelectItem value="Simples">Simples Nacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regimeTributario">Regime Tributário</Label>
            <Select
              value={regimeTributario}
              onValueChange={(value) => setRegimeTributario(value as 'Simples' | 'LucroPresumido' | 'LucroReal')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples">Simples Nacional</SelectItem>
                <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                <SelectItem value="LucroReal">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor Base de Cálculo (R$)</Label>
          <Input
            id="valor"
            placeholder="0,00"
            value={valor}
            onChange={handleValorChange}
          />
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleCalcular}
          disabled={isLoading}
        >
          {isLoading ? "Calculando..." : "Calcular"}
        </Button>

        {resultado && (
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h3 className="font-medium">Resultado do cálculo</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm">Base de cálculo:</div>
              <div className="text-sm font-medium text-right">R$ {resultado.valorBase.toFixed(2)}</div>
              
              <div className="text-sm">Alíquota efetiva:</div>
              <div className="text-sm font-medium text-right">{(resultado.aliquotaEfetiva * 100).toFixed(2)}%</div>
              
              <div className="text-sm">Valor do imposto:</div>
              <div className="text-sm font-medium text-right">R$ {resultado.valorFinal.toFixed(2)}</div>
              
              <div className="text-sm">Data de vencimento:</div>
              <div className="text-sm font-medium text-right">
                {new Date(resultado.dataVencimento).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={handleGerarDARF}
              disabled={isLoading}
            >
              {isLoading ? "Gerando..." : "Gerar DARF/Guia"}
            </Button>
          </div>
        )}

        {codigoBarras && (
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h3 className="font-medium">Código de Barras</h3>
            <p className="text-sm break-all font-mono">{codigoBarras}</p>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(codigoBarras);
                  toast({
                    title: "Código copiado",
                    description: "O código de barras foi copiado para a área de transferência",
                  });
                }}
              >
                Copiar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
