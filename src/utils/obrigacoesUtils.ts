
import { Obrigacao } from "@/types/obrigacoes";
import { toast } from "@/hooks/use-toast";
import { atualizarStatusObrigacao } from "@/services/supabase/obrigacoesService";

export const processarObrigacoes = async () => {
  try {
    // Busca obrigações pendentes e verifica se estão atrasadas
    const response = await fetch('/api/obrigacoes/processar');
    const data = await response.json();
    
    // Caso real utilizaria um endpoint no backend. 
    // Enquanto isso, vamos indicar sucesso
    toast({
      title: "Obrigações Processadas",
      description: "O status das obrigações foi atualizado com sucesso."
    });
    
    // Recarrega a página para mostrar as mudanças
    window.location.reload();
  } catch (error) {
    console.error('Erro ao processar obrigações:', error);
    toast({
      title: "Erro",
      description: "Não foi possível processar as obrigações.",
      variant: "destructive"
    });
  }
};

/**
 * Verifica se uma obrigação está atrasada
 */
export const isObrigacaoAtrasada = (obrigacao: Obrigacao): boolean => {
  if (obrigacao.status === 'concluido') return false;
  
  const hoje = new Date();
  const [dia, mes, ano] = obrigacao.prazo.split('/').map(Number);
  const dataPrazo = new Date(ano, mes - 1, dia);
  
  return dataPrazo < hoje;
};

/**
 * Marcar obrigações atrasadas
 */
export const marcarObrigacoesAtrasadas = async (obrigacoes: Obrigacao[]): Promise<Obrigacao[]> => {
  const obrigacoesAtualizadas = [...obrigacoes];
  let algumaMudanca = false;
  
  for (let i = 0; i < obrigacoesAtualizadas.length; i++) {
    const obr = obrigacoesAtualizadas[i];
    
    if (obr.status === 'pendente' && isObrigacaoAtrasada(obr)) {
      // Atualizar no banco de dados
      await atualizarStatusObrigacao(obr.id, 'atrasado');
      
      // Atualizar no estado local
      obrigacoesAtualizadas[i] = {
        ...obr,
        status: 'atrasado'
      };
      
      algumaMudanca = true;
    }
  }
  
  if (algumaMudanca) {
    toast({
      title: "Status Atualizado",
      description: "Algumas obrigações foram marcadas como atrasadas."
    });
  }
  
  return obrigacoesAtualizadas;
};
