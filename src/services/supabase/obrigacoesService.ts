
import { supabase } from "@/integrations/supabase/client";
import { Obrigacao } from "@/types/obrigacoes";

/**
 * Busca todas as obrigações fiscais de um cliente
 * @param clientId ID do cliente (opcional)
 */
export async function fetchObrigacoesFiscais(clientId?: string): Promise<Obrigacao[]> {
  try {
    // We'll use mock data since the obrigacoes_fiscais table doesn't exist yet
    // When the table is created, uncomment this code
    /*
    let query = supabase.from('obrigacoes_fiscais').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('prazo');
    
    if (error) {
      console.error('Erro ao buscar obrigações fiscais:', error);
      throw error;
    }
    
    return data.map(obrigacao => ({
      ...obrigacao,
      status: obrigacao.status as "pendente" | "atrasado" | "concluido",
      prioridade: obrigacao.prioridade as "baixa" | "media" | "alta"
    })) as Obrigacao[];
    */
    
    // Temporariamente retornamos dados mockados enquanto a tabela não existe
    return getObrigacoesMock(clientId);
  } catch (error) {
    console.error('Erro ao buscar obrigações fiscais:', error);
    
    // Temporariamente retornamos dados mockados enquanto a tabela não existe
    return getObrigacoesMock(clientId);
  }
}

// Dados mockados temporários enquanto a tabela não existe
function getObrigacoesMock(clientId?: string): Obrigacao[] {
  const allObrigacoes = [
    {
      id: 1,
      nome: "DARF IRPJ",
      tipo: "Federal",
      prazo: "30/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "pendente" as const, 
      prioridade: "alta" as const
    },
    {
      id: 2,
      nome: "GFIP",
      tipo: "Federal",
      prazo: "20/05/2025",
      empresa: "XYZ Comércio S.A.",
      status: "concluido" as const, 
      prioridade: "media" as const
    },
    {
      id: 3,
      nome: "GPS",
      tipo: "Federal",
      prazo: "15/05/2025",
      empresa: "Tech Solutions",
      status: "concluido" as const, 
      prioridade: "alta" as const
    },
    {
      id: 4,
      nome: "EFD ICMS/IPI",
      tipo: "Estadual",
      prazo: "10/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "atrasado" as const, 
      prioridade: "alta" as const
    },
    {
      id: 5,
      nome: "DeSTDA",
      tipo: "Estadual",
      prazo: "28/05/2025",
      empresa: "XYZ Comércio S.A.",
      status: "pendente" as const, 
      prioridade: "media" as const
    },
    {
      id: 6,
      nome: "DCTF",
      tipo: "Federal",
      prazo: "22/05/2025",
      empresa: "Tech Solutions",
      status: "atrasado" as const, 
      prioridade: "media" as const
    },
    {
      id: 7,
      nome: "ISS",
      tipo: "Municipal",
      prazo: "10/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "pendente" as const, 
      prioridade: "baixa" as const
    }
  ];
  
  // If a clientId is provided, filter the mock data
  if (clientId) {
    // This is simplified, in real data you'd match actual client IDs
    if (clientId.includes('abc')) {
      return allObrigacoes.filter(obr => obr.empresa.includes('ABC'));
    } else if (clientId.includes('xyz')) {
      return allObrigacoes.filter(obr => obr.empresa.includes('XYZ'));
    } else if (clientId.includes('tech')) {
      return allObrigacoes.filter(obr => obr.empresa.includes('Tech'));
    }
  }
  
  return allObrigacoes;
}
