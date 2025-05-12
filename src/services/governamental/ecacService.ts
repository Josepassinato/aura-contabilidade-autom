import { toast } from '@/hooks/use-toast';

// Tipos para as requisições
export interface EcacCredentials {
  username: string;
  password: string;
  certificado?: {
    arquivo: string;
    senha: string;
  };
  dados?: {
    cnpj?: string;
    cpf?: string;
  };
}

export interface CertidaoNegativaResponse {
  status: 'regular' | 'pendente' | 'irregular';
  dataEmissao: string;
  dataValidade: string;
  numero: string;
  url?: string;
  pendencias?: Array<{
    tipo: string;
    descricao: string;
    valor: number;
    dataVencimento: string;
  }>;
}

export interface DeclaracaoResponse {
  tipo: string;
  periodo: string;
  dataEntrega: string;
  situacao: 'entregue' | 'pendente' | 'em_processamento';
  url?: string;
}

// Função para simular autenticação no e-CAC
export async function autenticarEcac(credentials: EcacCredentials): Promise<boolean> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulação de validação simples
    if (credentials.username && credentials.password) {
      console.log('Autenticação no e-CAC realizada com sucesso');
      return true;
    } else {
      throw new Error('Credenciais inválidas');
    }
  } catch (error: any) {
    console.error('Erro na autenticação do e-CAC:', error);
    toast({
      title: 'Erro na autenticação',
      description: error.message || 'Não foi possível autenticar no e-CAC',
      variant: 'destructive'
    });
    return false;
  }
}

// Obter Certidão Negativa de Débito
export async function obterCertidaoNegativa(cnpj: string): Promise<CertidaoNegativaResponse | null> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Dados mockados para demonstração
    return {
      status: Math.random() > 0.3 ? 'regular' : 'pendente',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numero: `CND${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      url: 'https://exemplo.gov.br/cnd.pdf',
      pendencias: Math.random() > 0.7 ? [
        {
          tipo: 'IRPJ',
          descricao: 'Imposto de Renda Pessoa Jurídica pendente',
          valor: Math.random() * 10000,
          dataVencimento: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ] : []
    };
  } catch (error: any) {
    console.error('Erro ao obter Certidão Negativa:', error);
    toast({
      title: 'Erro ao obter Certidão',
      description: error.message || 'Não foi possível obter a Certidão Negativa',
      variant: 'destructive'
    });
    return null;
  }
}

// Obter declarações fiscais
export async function obterDeclaracoes(cnpj: string, ano: number): Promise<DeclaracaoResponse[]> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dados mockados para demonstração
    const declaracoes = [
      {
        tipo: 'DCTF',
        periodo: `${ano}-01`,
        dataEntrega: `${ano}-02-28`,
        situacao: 'entregue' as const,
        url: 'https://exemplo.gov.br/dctf.pdf'
      },
      {
        tipo: 'EFD-Contribuições',
        periodo: `${ano}-01`,
        dataEntrega: `${ano}-02-25`,
        situacao: 'entregue' as const,
        url: 'https://exemplo.gov.br/efd-contrib.pdf'
      },
      {
        tipo: 'SPED Contábil',
        periodo: `${ano}`,
        dataEntrega: `${ano}-05-31`,
        situacao: ano < new Date().getFullYear() ? 'entregue' as const : 'pendente' as const
      }
    ];
    
    return declaracoes;
  } catch (error: any) {
    console.error('Erro ao obter Declarações:', error);
    toast({
      title: 'Erro ao obter Declarações',
      description: error.message || 'Não foi possível obter as declarações fiscais',
      variant: 'destructive'
    });
    return [];
  }
}

// Verificar débitos fiscais
export async function verificarDebitosFiscais(cnpj: string): Promise<Array<{
  tipo: string;
  referencia: string;
  valor: number;
  vencimento: string;
  situacao: 'aberto' | 'vencido' | 'parcelado';
}>> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Dados mockados para demonstração
    return [
      {
        tipo: 'IRPJ',
        referencia: '2023 - 1º Trimestre',
        valor: 4567.89,
        vencimento: '2023-04-30',
        situacao: 'aberto'
      },
      {
        tipo: 'CSLL',
        referencia: '2023 - 1º Trimestre',
        valor: 1643.22,
        vencimento: '2023-04-30',
        situacao: 'aberto'
      },
      {
        tipo: 'PIS',
        referencia: '01/2023',
        valor: 523.45,
        vencimento: '2023-02-25',
        situacao: 'vencido'
      }
    ];
  } catch (error: any) {
    console.error('Erro ao verificar débitos fiscais:', error);
    toast({
      title: 'Erro ao verificar débitos',
      description: error.message || 'Não foi possível verificar os débitos fiscais',
      variant: 'destructive'
    });
    return [];
  }
}
