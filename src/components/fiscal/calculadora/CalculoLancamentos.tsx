
import React from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcularImpostosPorLancamentos } from "@/services/fiscal/calculoFiscal";
import { ResultadosDisplay } from "./ResultadosDisplay";
import { TipoImposto, ResultadoCalculo } from "@/services/fiscal/types";
import { PagamentoResponse } from "@/services/bancario/openBankingService";

interface CalculoLancamentosProps {
  cnpj: string;
  setCnpj: (value: string) => void;
  periodo: string;
  setPeriodo: (value: string) => void;
  regimeTributario: "Simples" | "LucroPresumido" | "LucroReal";
  setRegimeTributario: (value: "Simples" | "LucroPresumido" | "LucroReal") => void;
  resultados: Record<TipoImposto, ResultadoCalculo> | null;
  setResultados: (resultados: Record<TipoImposto, ResultadoCalculo> | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  selectedBanco: string;
  pagamentoStatus: Record<string, PagamentoResponse | null>;
  onPagamento: (tipo: TipoImposto, resultado: ResultadoCalculo) => void;
}

export const CalculoLancamentos: React.FC<CalculoLancamentosProps> = ({
  cnpj,
  setCnpj,
  periodo,
  setPeriodo,
  regimeTributario,
  setRegimeTributario,
  resultados,
  setResultados,
  isLoading,
  setIsLoading,
  selectedBanco,
  pagamentoStatus,
  onPagamento
}) => {
  const handleCalcular = async () => {
    if (!cnpj || !periodo) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o CNPJ e o período para calcular.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      // Call with just the two required parameters
      const result = await calcularImpostosPorLancamentos(cnpj, periodo);
      
      // Convert array results to record object
      const formattedResults: Record<TipoImposto, ResultadoCalculo> = {};
      
      if (Array.isArray(result)) {
        result.forEach((item: ResultadoCalculo) => {
          if (item.tipoImposto) {
            formattedResults[item.tipoImposto] = item;
          }
        });
      }
      
      // Make sure we're passing a non-empty object
      if (Object.keys(formattedResults).length === 0) {
        throw new Error("Nenhum resultado foi retornado pelo cálculo");
      }
      
      setResultados(formattedResults);
      
      toast({
        title: "Cálculo realizado",
        description: `Impostos calculados com base nos lançamentos contábeis do período ${periodo}.`
      });
    } catch (error) {
      console.error("Erro ao calcular impostos:", error);
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular os impostos. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cálculo Automático por Lançamentos Contábeis</CardTitle>
          <CardDescription>
            Calcula automaticamente todos os impostos aplicáveis com base nos lançamentos contábeis do período
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj_lanc">CNPJ</Label>
              <Input 
                id="cnpj_lanc" 
                placeholder="00.000.000/0000-00" 
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="periodo_lanc">Período (YYYY-MM)</Label>
              <Input 
                id="periodo_lanc" 
                placeholder="2025-05" 
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regime_lanc">Regime Tributário</Label>
              <Select 
                value={regimeTributario} 
                onValueChange={(v) => setRegimeTributario(v as any)}
              >
                <SelectTrigger id="regime_lanc">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples">Simples Nacional</SelectItem>
                  <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                  <SelectItem value="LucroReal">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCalcular}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? "Calculando..." : "Calcular Impostos"}
          </Button>
        </CardFooter>
      </Card>
      
      {resultados && (
        <ResultadosDisplay 
          resultados={resultados} 
          cnpj={cnpj} 
          periodo={periodo} 
          isLoading={isLoading}
          pagamentoStatus={pagamentoStatus}
          selectedBanco={selectedBanco}
          onPagamento={onPagamento}
        />
      )}
    </>
  );
};
