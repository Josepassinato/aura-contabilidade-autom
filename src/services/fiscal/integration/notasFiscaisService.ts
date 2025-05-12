
import { toast } from "@/hooks/use-toast";
import { UF } from "@/services/governamental/estadualIntegration";
import { NotaFiscalMetadata } from "./types";
import { obterIntegracoesConfiguradasPorCNPJ } from "./integracoesConfig";

/**
 * Busca notas fiscais de uma empresa em um período
 * @param cnpj CNPJ da empresa
 * @param periodo Período no formato YYYY-MM
 * @param uf UF opcional para filtrar por estado
 * @returns Lista de metadados de notas fiscais
 */
export const buscarNotasFiscais = async (
  cnpj: string,
  periodo: string,
  uf?: UF
): Promise<NotaFiscalMetadata[]> => {
  try {
    console.log(`Buscando NFs para CNPJ ${cnpj} no período ${periodo}${uf ? ` e UF ${uf}` : ''}`);
    
    // Verificar integrações disponíveis
    const integracoes = await obterIntegracoesConfiguradasPorCNPJ(cnpj);
    
    if (!integracoes.some(i => i.status === 'conectado')) {
      throw new Error("Não há integrações ativas com SEFAZs para buscar notas fiscais");
    }
    
    // Em uma implementação real, aqui faríamos requisições para as APIs
    // das SEFAZs ou sistemas integrados usando as credenciais armazenadas
    
    // Simulação para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulando delay de rede
    
    // Simulação de notas fiscais (entre 5 e 15 notas para o período)
    const quantidade = Math.floor(Math.random() * 10) + 5;
    const notas: NotaFiscalMetadata[] = [];
    
    const [ano, mes] = periodo.split('-');
    const diasNoMes = new Date(Number(ano), Number(mes), 0).getDate();
    
    for (let i = 0; i < quantidade; i++) {
      // Gerar data aleatória dentro do período
      const dia = Math.floor(Math.random() * diasNoMes) + 1;
      const dataEmissao = `${ano}-${mes}-${String(dia).padStart(2, '0')}`;
      
      // Valor aleatório entre R$ 100 e R$ 10.000
      const valorTotal = Math.random() * 9900 + 100;
      
      const nota: NotaFiscalMetadata = {
        numero: `${Math.floor(Math.random() * 100000) + 1000}`,
        serie: `${Math.floor(Math.random() * 3) + 1}`,
        dataEmissao,
        valorTotal,
        chaveAcesso: `${Math.floor(Math.random() * 10**44)}`,
        cliente: {
          nome: `Cliente ${i + 1}`,
          cnpj: `${Math.floor(Math.random() * 10**14)}`.padStart(14, '0'),
          uf: uf || (["SP", "RJ", "MG", "PR", "RS"] as UF[])[Math.floor(Math.random() * 5)]
        },
        itens: Array(Math.floor(Math.random() * 5) + 1).fill(0).map((_, j) => {
          const valorUnitario = Math.random() * 1000 + 50;
          const quantidade = Math.floor(Math.random() * 10) + 1;
          return {
            codigo: `PROD${j + 1}`,
            descricao: `Produto ${j + 1}`,
            quantidade,
            valorUnitario,
            valorTotal: valorUnitario * quantidade,
            cfop: `5${Math.floor(Math.random() * 900) + 100}`,
            ncm: `${Math.floor(Math.random() * 10**8)}`.padStart(8, '0')
          };
        }),
        impostos: {
          ICMS: valorTotal * 0.18,
          PIS: valorTotal * 0.0165,
          COFINS: valorTotal * 0.076,
          IPI: valorTotal * 0.05
        }
      };
      
      notas.push(nota);
    }
    
    return notas;
    
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    toast({
      title: "Erro na busca de notas fiscais",
      description: error instanceof Error ? error.message : "Não foi possível obter os dados de notas fiscais",
      variant: "destructive",
    });
    return [];
  }
};
