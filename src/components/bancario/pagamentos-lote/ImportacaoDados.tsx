
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ImportacaoDadosProps {
  loteImportado: string;
  setLoteImportado: (value: string) => void;
  handleImportarLote: () => void;
}

export function ImportacaoDados({ loteImportado, setLoteImportado, handleImportarLote }: ImportacaoDadosProps) {
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
  );
}
