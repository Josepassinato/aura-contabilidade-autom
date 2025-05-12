
import { supabase } from "@/integrations/supabase/client";
import { Obrigacao } from "@/types/obrigacoes";

/**
 * Busca todas as obrigações fiscais de um cliente
 * @param clientId ID do cliente (opcional)
 */
export async function fetchObrigacoesFiscais(clientId?: string): Promise<Obrigacao[]> {
  try {
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
  } catch (error) {
    console.error('Erro ao buscar obrigações fiscais:', error);
    
    // Temporariamente retornamos dados mockados enquanto a tabela não existe
    return getObrigacoesMock();
  }
}

// Dados mockados temporários enquanto a tabela não existe
function getObrigacoesMock(): Obrigacao[] {
  return [
    {
      id: 1,
      nome: "DARF IRPJ",
      tipo: "Federal",
      prazo: "30/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "pendente", 
      prioridade: "alta"
    },
    {
      id: 2,
      nome: "GFIP",
      tipo: "Federal",
      prazo: "20/05/2025",
      empresa: "XYZ Comércio S.A.",
      status: "concluido", 
      prioridade: "media"
    },
    {
      id: 3,
      nome: "GPS",
      tipo: "Federal",
      prazo: "15/05/2025",
      empresa: "Tech Solutions",
      status: "concluido", 
      prioridade: "alta"
    },
    {
      id: 4,
      nome: "EFD ICMS/IPI",
      tipo: "Estadual",
      prazo: "10/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "atrasado", 
      prioridade: "alta"
    },
    {
      id: 5,
      nome: "DeSTDA",
      tipo: "Estadual",
      prazo: "28/05/2025",
      empresa: "XYZ Comércio S.A.",
      status: "pendente", 
      prioridade: "media"
    },
    {
      id: 6,
      nome: "DCTF",
      tipo: "Federal",
      prazo: "22/05/2025",
      empresa: "Tech Solutions",
      status: "atrasado", 
      prioridade: "media"
    },
    {
      id: 7,
      nome: "ISS",
      tipo: "Municipal",
      prazo: "10/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "pendente", 
      prioridade: "baixa"
    }
  ];
}
