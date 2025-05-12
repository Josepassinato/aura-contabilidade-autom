
import { supabase } from "@/integrations/supabase/client";
import { Obrigacao } from "@/types/obrigacoes";

/**
 * Busca todas as obrigações fiscais de um cliente
 * @param clientId ID do cliente (opcional)
 */
export async function fetchObrigacoesFiscais(clientId?: string): Promise<Obrigacao[]> {
  try {
    console.log('Iniciando busca de obrigações fiscais...');
    
    // Como a tabela obrigacoes_fiscais ainda não existe no Supabase,
    // vamos retornar dados mockados temporariamente
    const mockObrigacoes: Obrigacao[] = [
      {
        id: 1,
        nome: "DARF IRPJ",
        tipo: "Federal",
        prazo: "20/05/2025",
        empresa: "Empresa Exemplo LTDA",
        status: "pendente",
        prioridade: "alta"
      },
      {
        id: 2,
        nome: "GFIP",
        tipo: "Federal",
        prazo: "25/05/2025",
        empresa: "Empresa Exemplo LTDA",
        status: "pendente",
        prioridade: "media"
      },
      {
        id: 3,
        nome: "DCTF",
        tipo: "Federal",
        prazo: "15/05/2025",
        empresa: "Empresa Exemplo LTDA",
        status: "concluido",
        prioridade: "alta"
      }
    ];

    // Filtrar por cliente
    if (clientId) {
      return mockObrigacoes.filter(obr => obr.empresa === clientId);
    }
    
    return mockObrigacoes;
    
  } catch (error) {
    console.error('Erro ao buscar obrigações fiscais:', error);
    return [];
  }
}
