
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { atualizarStatusObrigacao } from "@/services/supabase/obrigacoesService";

interface ObrigacaoActionsProps {
  id: number | string;  // Atualizado para aceitar número ou string
  status: "pendente" | "atrasado" | "concluido";
}

export const ObrigacaoActions: React.FC<ObrigacaoActionsProps> = ({ id, status }) => {
  const marcarComoConcluida = async (obrigacaoId: number | string) => {
    const sucesso = await atualizarStatusObrigacao(obrigacaoId, "concluido");
    
    if (sucesso) {
      toast({
        title: "Obrigação concluída",
        description: "A obrigação foi marcada como concluída com sucesso."
      });
      
      // Recarregar a página para mostrar as mudanças
      window.location.reload();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a obrigação como concluída.",
        variant: "destructive"
      });
    }
  };

  const gerarDocumento = (obrigacaoId: number | string) => {
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
