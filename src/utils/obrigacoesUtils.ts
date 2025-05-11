
import { toast } from "@/hooks/use-toast";

export const processarObrigacoes = () => {
  toast({
    title: "Processamento iniciado",
    description: "As obrigações fiscais estão sendo processadas automaticamente."
  });
  
  // Simulação de processamento concluído após 2 segundos
  setTimeout(() => {
    toast({
      title: "Processamento concluído",
      description: "Todas as obrigações foram processadas e atualizadas."
    });
  }, 2000);
};
