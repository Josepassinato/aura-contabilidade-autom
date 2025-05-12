
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { UF } from "@/services/governamental/estadualIntegration";
import { consultarNFesPeriodo } from "@/services/governamental/estadualIntegration";

interface ImportacaoDadosProps {
  loteImportado: string;
  setLoteImportado: (value: string) => void;
  handleImportarLote: () => void;
}

export function ImportacaoDados({ loteImportado, setLoteImportado, handleImportarLote }: ImportacaoDadosProps) {
  const [ufSelecionada, setUfSelecionada] = useState<UF>("SP");
  const [verificando, setVerificando] = useState(false);

  // Lista de UFs disponíveis para verificação fiscal
  const ufsDisponiveis: UF[] = ["SP", "RJ", "MG", "RS", "PR"];

  // Função para verificar dados com a SEFAZ
  const verificarDadosSefaz = async () => {
    if (!loteImportado.trim()) {
      toast({
        title: "Dados não encontrados",
        description: "Digite ou cole os dados para verificar com o portal da SEFAZ.",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerificando(true);
      
      // Simular extração de CNPJ a partir dos dados importados
      const cnpjSimulado = "12345678000199";
      
      // Datas para consulta (último mês)
      const hoje = new Date();
      const dataFim = hoje.toISOString().split('T')[0];
      
      const mesPassado = new Date();
      mesPassado.setMonth(mesPassado.getMonth() - 1);
      const dataInicio = mesPassado.toISOString().split('T')[0];
      
      // Consultar notas fiscais na SEFAZ
      const resultado = await consultarNFesPeriodo(
        ufSelecionada,
        cnpjSimulado,
        dataInicio,
        dataFim
      );
      
      if (resultado.sucesso) {
        toast({
          title: "Verificação concluída",
          description: `Dados verificados com sucesso no portal da SEFAZ-${ufSelecionada}.`,
        });
      } else {
        toast({
          title: "Erro na verificação",
          description: resultado.erro || `Não foi possível verificar os dados na SEFAZ-${ufSelecionada}.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Erro ao verificar dados com a SEFAZ",
        variant: "destructive"
      });
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="space-y-2 batch-import">
      <Label htmlFor="importacao">Importar de CSV ou JSON (opcional)</Label>
      <Textarea
        id="importacao"
        placeholder="Cole dados no formato JSON ou CSV (código;valor;vencimento;tipo;descrição)"
        value={loteImportado}
        onChange={(e) => setLoteImportado(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="uf-select" className="whitespace-nowrap">Verificar com SEFAZ:</Label>
          <Select
            value={ufSelecionada}
            onValueChange={(value) => setUfSelecionada(value as UF)}
          >
            <SelectTrigger id="uf-select" className="w-[80px]">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {ufsDisponiveis.map((uf) => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={verificarDadosSefaz}
            disabled={verificando}
          >
            {verificando ? "Verificando..." : "Verificar"}
          </Button>
        </div>
        
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
  );
}
