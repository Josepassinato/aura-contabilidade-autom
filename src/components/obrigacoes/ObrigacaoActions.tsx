
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ObrigacaoActionsProps {
  id: number;
  status: "pendente" | "atrasado" | "concluido";
}

export const ObrigacaoActions: React.FC<ObrigacaoActionsProps> = ({ id, status }) => {
  const marcarComoConcluida = (obrigacaoId: number) => {
    toast({
      title: "Obrigação concluída",
      description: "A obrigação foi marcada como concluída com sucesso."
    });
  };

  const gerarDocumento = (obrigacaoId: number) => {
    toast({
      title: "Documento gerado",
      description: "O documento foi gerado com sucesso e está disponível para download."
    });
  };

  return (
    <div className="flex justify-center space-x-2">
      {status !== "concluido" && (
        <Button 
          size="sm" 
          variant="outline"
          title="Marcar como concluída"
          onClick={() => marcarComoConcluida(id)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Concluir
        </Button>
      )}
      <Button 
        size="sm" 
        variant="outline"
        title="Gerar documento"
        onClick={() => gerarDocumento(id)}
      >
        <FileText className="h-4 w-4 mr-1" />
        Gerar
      </Button>
    </div>
  );
};
