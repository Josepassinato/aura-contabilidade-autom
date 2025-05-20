
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface DeclaracaoSimplesNacional {
  id?: string;
  client_id: string;
  cnpj: string;
  ano: number;
  mes?: number | null;
  receita_bruta: number;
  impostos?: any;
  situacao?: string;
}

export interface DeclaracaoSimplesNacionalResponse {
  success: boolean;
  data?: DeclaracaoSimplesNacional[];
  error?: string;
}

/**
 * Busca as declarações do Simples Nacional de um cliente
 * @param clientId ID do cliente
 * @param ano Ano das declarações (opcional)
 * @returns Promise com a resposta contendo as declarações
 */
export async function fetchDeclaracoesSimplesNacional(
  clientId: string,
  ano?: number
): Promise<DeclaracaoSimplesNacionalResponse> {
  try {
    if (!clientId) {
      throw new Error("ID do cliente não informado");
    }

    let query = supabase
      .from('declaracoes_simples_nacional')
      .select('*')
      .eq('client_id', clientId);
      
    // Filtrar por ano se fornecido
    if (ano) {
      query = query.eq('ano', ano);
    }
    
    // Ordenar por ano e mês, mais recentes primeiro
    query = query.order('ano', { ascending: false })
                .order('mes', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar declarações do Simples Nacional:', error);
      throw error;
    }

    return {
      success: true,
      data: data as DeclaracaoSimplesNacional[]
    };
  } catch (error: any) {
    console.error('Erro ao buscar declarações do Simples Nacional:', error);
    return {
      success: false,
      error: error.message || "Não foi possível buscar as declarações do Simples Nacional"
    };
  }
}

/**
 * Salva uma declaração do Simples Nacional
 * @param declaracao Dados da declaração
 * @returns Promise indicando sucesso ou falha
 */
export async function saveDeclaracaoSimplesNacional(
  declaracao: DeclaracaoSimplesNacional
): Promise<boolean> {
  try {
    if (!declaracao.client_id || !declaracao.cnpj) {
      throw new Error("ID do cliente e CNPJ são obrigatórios");
    }

    if (!declaracao.ano || !declaracao.receita_bruta) {
      throw new Error("Ano e receita bruta são obrigatórios");
    }

    let result;

    // Verificar se já existe uma declaração para o mesmo período
    const { data: existingDeclaracao } = await supabase
      .from('declaracoes_simples_nacional')
      .select('id')
      .eq('client_id', declaracao.client_id)
      .eq('cnpj', declaracao.cnpj)
      .eq('ano', declaracao.ano)
      .eq('mes', declaracao.mes || null)
      .maybeSingle();

    if (existingDeclaracao?.id) {
      // Atualizar registro existente
      result = await supabase
        .from('declaracoes_simples_nacional')
        .update({
          receita_bruta: declaracao.receita_bruta,
          impostos: declaracao.impostos,
          situacao: declaracao.situacao,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDeclaracao.id);
    } else {
      // Inserir novo registro
      result = await supabase
        .from('declaracoes_simples_nacional')
        .insert([{
          ...declaracao,
          data_consulta: new Date().toISOString()
        }]);
    }

    if (result.error) {
      throw result.error;
    }

    toast({
      title: "Declaração salva",
      description: "A declaração do Simples Nacional foi salva com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao salvar declaração do Simples Nacional:', error);
    
    toast({
      title: "Erro ao salvar declaração",
      description: error.message || "Não foi possível salvar a declaração do Simples Nacional",
      variant: "destructive"
    });
    
    return false;
  }
}

/**
 * Exclui uma declaração do Simples Nacional
 * @param declaracaoId ID da declaração a ser excluída
 * @returns Promise indicando sucesso ou falha
 */
export async function deleteDeclaracaoSimplesNacional(declaracaoId: string): Promise<boolean> {
  try {
    if (!declaracaoId) {
      throw new Error("ID da declaração não informado");
    }

    const { error } = await supabase
      .from('declaracoes_simples_nacional')
      .delete()
      .eq('id', declaracaoId);

    if (error) {
      throw error;
    }

    toast({
      title: "Declaração excluída",
      description: "A declaração do Simples Nacional foi excluída com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao excluir declaração do Simples Nacional:', error);
    
    toast({
      title: "Erro ao excluir declaração",
      description: error.message || "Não foi possível excluir a declaração do Simples Nacional",
      variant: "destructive"
    });
    
    return false;
  }
}
