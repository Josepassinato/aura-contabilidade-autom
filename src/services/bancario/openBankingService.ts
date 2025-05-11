
import { toast } from '@/hooks/use-toast';

// Tipos para as requisições
export interface BankCredentials {
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: 'corrente' | 'poupanca';
  chavePix?: {
    tipo: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
    valor: string;
  };
  token?: string;
}

export interface TransacaoBancaria {
  id: string;
  data: string;
  valor: number;
  tipo: 'credito' | 'debito';
  descricao: string;
  categoria?: string;
  contraparte?: string;
  documentoContraparte?: string;
}

export interface SaldoBancario {
  saldoAtual: number;
  saldoDisponivel: number;
  limiteCredito?: number;
  dataConsulta: string;
}

// Função para autenticar na API do banco
export async function autenticarBanco(credentials: BankCredentials): Promise<boolean> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulação de validação simples
    if (credentials.banco && credentials.agencia && credentials.conta) {
      console.log('Autenticação bancária realizada com sucesso');
      return true;
    } else {
      throw new Error('Credenciais bancárias inválidas');
    }
  } catch (error: any) {
    console.error('Erro na autenticação bancária:', error);
    toast({
      title: 'Erro na autenticação bancária',
      description: error.message || 'Não foi possível autenticar na API do banco',
      variant: 'destructive'
    });
    return false;
  }
}

// Função para obter extrato bancário
export async function obterExtratoBancario(
  credenciais: BankCredentials,
  dataInicio: string,
  dataFim: string
): Promise<TransacaoBancaria[]> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Gerando dados de exemplo para o período
    const transacoes: TransacaoBancaria[] = [];
    const dataInicial = new Date(dataInicio);
    const dataFinal = new Date(dataFim);
    
    // Gera transações aleatórias para o período
    let dataAtual = new Date(dataInicial);
    while (dataAtual <= dataFinal) {
      // Número aleatório de transações por dia (0 a 5)
      const numTransacoes = Math.floor(Math.random() * 6);
      
      for (let i = 0; i < numTransacoes; i++) {
        const tipo = Math.random() > 0.5 ? 'credito' : 'debito';
        const valor = parseFloat((Math.random() * 10000).toFixed(2));
        
        let descricao = '';
        let categoria = '';
        let contraparte = '';
        
        if (tipo === 'credito') {
          const opcoes = ['Pagamento recebido', 'Transferência recebida', 'Depósito', 'PIX recebido'];
          descricao = opcoes[Math.floor(Math.random() * opcoes.length)];
          categoria = 'Receita';
          contraparte = `Cliente ${Math.floor(Math.random() * 100)}`;
        } else {
          const opcoes = ['Pagamento efetuado', 'Transferência enviada', 'Débito automático', 'PIX enviado', 'Tarifa bancária'];
          descricao = opcoes[Math.floor(Math.random() * opcoes.length)];
          categoria = Math.random() > 0.7 ? 'Despesa Operacional' : 'Fornecedores';
          contraparte = `Fornecedor ${Math.floor(Math.random() * 100)}`;
        }
        
        transacoes.push({
          id: `TRANS${Math.floor(Math.random() * 1000000)}`,
          data: new Date(dataAtual).toISOString().split('T')[0],
          valor,
          tipo,
          descricao,
          categoria,
          contraparte,
          documentoContraparte: Math.random() > 0.5 ? `${Math.floor(Math.random() * 100000000000).toString().padStart(11, '0')}` : undefined
        });
      }
      
      // Avança para o próximo dia
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  } catch (error: any) {
    console.error('Erro ao obter extrato bancário:', error);
    toast({
      title: 'Erro ao obter extrato',
      description: error.message || 'Não foi possível obter o extrato bancário',
      variant: 'destructive'
    });
    return [];
  }
}

// Função para obter saldo bancário
export async function obterSaldo(credenciais: BankCredentials): Promise<SaldoBancario | null> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dados mockados para demonstração
    return {
      saldoAtual: parseFloat((Math.random() * 50000).toFixed(2)),
      saldoDisponivel: parseFloat((Math.random() * 48000).toFixed(2)),
      limiteCredito: parseFloat((Math.random() * 20000).toFixed(2)),
      dataConsulta: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Erro ao obter saldo bancário:', error);
    toast({
      title: 'Erro ao obter saldo',
      description: error.message || 'Não foi possível obter o saldo bancário',
      variant: 'destructive'
    });
    return null;
  }
}

// Função para realizar pagamento de guia
export async function realizarPagamento(
  credenciais: BankCredentials,
  codigoBarras: string,
  valor: number,
  dataVencimento: string,
  dataPagamento: string
): Promise<{ sucesso: boolean; idTransacao?: string; mensagem?: string }> {
  try {
    // Simulação de uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulação de sucesso do pagamento (90% das vezes)
    if (Math.random() > 0.1) {
      return {
        sucesso: true,
        idTransacao: `PAG${Math.floor(Math.random() * 1000000)}`,
        mensagem: 'Pagamento agendado com sucesso'
      };
    } else {
      throw new Error('Falha no processamento do pagamento. Saldo insuficiente.');
    }
  } catch (error: any) {
    console.error('Erro ao realizar pagamento:', error);
    toast({
      title: 'Erro no pagamento',
      description: error.message || 'Não foi possível realizar o pagamento',
      variant: 'destructive'
    });
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processamento do pagamento'
    };
  }
}

// Função para importar extrato e categorizar automáticamente
export async function importarECategorizar(
  credenciais: BankCredentials,
  dataInicio: string,
  dataFim: string
): Promise<{ 
  transacoes: TransacaoBancaria[];
  categorizadas: number;
  naoCategorizadas: number;
}> {
  try {
    // Primeiro obtém o extrato
    const transacoes = await obterExtratoBancario(credenciais, dataInicio, dataFim);
    
    // Simula categorização automática (80% das transações são categorizadas)
    const categorizadas = Math.floor(transacoes.length * 0.8);
    const naoCategorizadas = transacoes.length - categorizadas;
    
    // Aplica categorias para demonstração
    const categorias = [
      'Fornecedores', 'Folha de Pagamento', 'Impostos', 
      'Aluguel', 'Despesas Operacionais', 'Receitas de Serviços',
      'Receitas de Vendas', 'Transferências', 'Investimentos'
    ];
    
    const transacoesCategorizadas = transacoes.map((transacao, index) => {
      // Aplica categoria apenas para as transações "categorizadas"
      if (index < categorizadas) {
        return {
          ...transacao,
          categoria: categorias[Math.floor(Math.random() * categorias.length)]
        };
      }
      return transacao;
    });
    
    return {
      transacoes: transacoesCategorizadas,
      categorizadas,
      naoCategorizadas
    };
  } catch (error: any) {
    console.error('Erro ao importar e categorizar extrato:', error);
    toast({
      title: 'Erro na importação',
      description: error.message || 'Não foi possível importar e categorizar o extrato',
      variant: 'destructive'
    });
    return {
      transacoes: [],
      categorizadas: 0,
      naoCategorizadas: 0
    };
  }
}
