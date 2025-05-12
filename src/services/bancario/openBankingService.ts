
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

// Interface para requisição de pagamento de guia
export interface PagamentoGuiaRequest {
  credentials: BankCredentials;
  codigoBarras: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string;
  descricao?: string;
  tipo: 'DARF' | 'GPS' | 'DAS' | 'FGTS' | 'IPTU' | 'IPVA' | 'Boleto';
}

// Interface para resposta do pagamento
export interface PagamentoResponse {
  sucesso: boolean;
  idTransacao?: string;
  mensagem?: string;
  comprovante?: string;
  dataConfirmacao?: string;
  statusProcessamento: 'pendente' | 'processando' | 'confirmado' | 'falha';
}

// Configuração para requisições Open Banking
export interface OpenBankingConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
}

// Status de tokenização
export type TokenStatus = 'nao_autorizado' | 'autorizado' | 'expirado' | 'revogado';

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

// Função avançada para pagamento de guias e tributos com resposta mais detalhada
export async function realizarPagamentoAvancado(
  request: PagamentoGuiaRequest
): Promise<PagamentoResponse> {
  try {
    // Verificar autenticação
    const autenticado = await autenticarBanco(request.credentials);
    if (!autenticado) {
      throw new Error('Falha na autenticação com o banco');
    }
    
    // Verificar se código de barras é válido
    if (!validarCodigoBarras(request.codigoBarras, request.tipo)) {
      throw new Error('Código de barras inválido para o tipo de documento');
    }
    
    // Verificar saldo disponível
    const saldo = await obterSaldo(request.credentials);
    if (!saldo || saldo.saldoDisponivel < request.valor) {
      throw new Error('Saldo insuficiente para realizar o pagamento');
    }
    
    // Simulação de tempo de processamento (API real)
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    // Gerar ID de transação único
    const idTransacao = `${request.tipo.substring(0,3)}${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    // Simular taxa de sucesso (95% de sucesso)
    if (Math.random() > 0.05) {
      // Gerar um link de comprovante simulado
      const comprovante = `https://comprovantes.contaflix.com.br/${idTransacao}.pdf`;
      
      // Retornar resposta de sucesso
      return {
        sucesso: true,
        idTransacao,
        mensagem: 'Pagamento processado com sucesso',
        comprovante,
        dataConfirmacao: new Date().toISOString(),
        statusProcessamento: 'confirmado'
      };
    } else {
      // Simular falha de processamento
      return {
        sucesso: false,
        idTransacao,
        mensagem: 'O pagamento foi recebido pelo banco, mas está em processamento',
        statusProcessamento: 'processando'
      };
    }
  } catch (error: any) {
    console.error('Erro no processamento do pagamento:', error);
    
    toast({
      title: 'Erro no pagamento',
      description: error.message || 'Não foi possível processar o pagamento',
      variant: 'destructive'
    });
    
    return {
      sucesso: false,
      mensagem: error.message,
      statusProcessamento: 'falha'
    };
  }
}

// Função para agendar pagamentos em lote
export async function agendarPagamentosEmLote(
  credenciais: BankCredentials,
  pagamentos: Array<{
    codigoBarras: string;
    valor: number;
    dataVencimento: string;
    dataPagamento: string;
    descricao: string;
    tipo: 'DARF' | 'GPS' | 'DAS' | 'FGTS' | 'IPTU' | 'IPVA' | 'Boleto';
  }>
): Promise<{
  sucessos: number;
  falhas: number;
  detalhes: Array<{ 
    sucesso: boolean; 
    idTransacao?: string; 
    mensagem?: string;
    index: number;
  }>;
}> {
  try {
    // Verificar autenticação
    const autenticado = await autenticarBanco(credenciais);
    if (!autenticado) {
      throw new Error('Falha na autenticação com o banco');
    }
    
    // Processar cada pagamento individualmente
    const resultados = await Promise.all(
      pagamentos.map(async (pagamento, index) => {
        try {
          // Simulação de processamento para cada pagamento
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 90% de chance de sucesso para cada pagamento
          if (Math.random() > 0.1) {
            return {
              sucesso: true,
              idTransacao: `PAG${Date.now()}${index}`,
              mensagem: 'Pagamento agendado com sucesso',
              index
            };
          } else {
            return {
              sucesso: false,
              mensagem: 'Falha ao processar este pagamento específico',
              index
            };
          }
        } catch (error: any) {
          return {
            sucesso: false,
            mensagem: error.message || 'Erro no processamento',
            index
          };
        }
      })
    );
    
    // Calcular estatísticas
    const sucessos = resultados.filter(r => r.sucesso).length;
    const falhas = resultados.length - sucessos;
    
    // Mostrar notificação
    toast({
      title: 'Agendamento em lote processado',
      description: `${sucessos} pagamentos agendados com sucesso e ${falhas} falhas.`,
      variant: falhas === 0 ? 'default' : 'destructive'
    });
    
    return {
      sucessos,
      falhas,
      detalhes: resultados
    };
    
  } catch (error: any) {
    console.error('Erro ao agendar pagamentos em lote:', error);
    
    toast({
      title: 'Erro no agendamento em lote',
      description: error.message || 'Não foi possível processar o agendamento em lote',
      variant: 'destructive'
    });
    
    return {
      sucessos: 0,
      falhas: pagamentos.length,
      detalhes: pagamentos.map((_, index) => ({
        sucesso: false,
        mensagem: error.message || 'Falha geral no processamento',
        index
      }))
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

// Função para iniciar processo de autorização OAuth para Open Banking
export async function iniciarAutorizacaoOpenBanking(
  config: OpenBankingConfig
): Promise<string> {
  try {
    // Em uma implementação real, aqui construiríamos a URL de autorização para o Open Banking
    
    // Estado aleatório para segurança contra CSRF
    const state = Math.random().toString(36).substring(2, 15);
    
    // Armazenar state para validação posterior
    localStorage.setItem('openbanking_state', state);
    
    // Construir URL de autorização
    const authorizationUrl = `${config.apiUrl}/authorize?` + 
      `client_id=${encodeURIComponent(config.clientId)}` +
      `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(config.scopes.join(' '))}` +
      `&state=${state}`;
    
    return authorizationUrl;
  } catch (error: any) {
    console.error('Erro ao iniciar autorização Open Banking:', error);
    toast({
      title: 'Erro na autorização',
      description: error.message || 'Não foi possível iniciar o processo de autorização',
      variant: 'destructive'
    });
    throw error;
  }
}

// Função para processar callback de autorização
export async function processarCallbackAutorizacao(
  url: string,
  config: OpenBankingConfig
): Promise<{
  sucesso: boolean;
  token?: string;
  expiraEm?: number;
  mensagem?: string;
}> {
  try {
    // Extrair parâmetros da URL
    const urlParams = new URLSearchParams(new URL(url).search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('openbanking_state');
    
    // Verificar state para prevenir CSRF
    if (!state || state !== storedState) {
      throw new Error('Falha na validação de segurança da autorização');
    }
    
    if (!code) {
      throw new Error('Código de autorização não recebido');
    }
    
    // Simulação de chamada à API para trocar o código por um token
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulação de resposta bem-sucedida
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
      sub: 'user123',
      name: 'Conta Bancária',
      exp: Math.floor(Date.now() / 1000) + 3600
    }))}.signature`;
    
    // Armazenar token (em um ambiente real, seria mais seguro usar cookies HttpOnly)
    localStorage.setItem('openbanking_token', token);
    localStorage.setItem('openbanking_token_expiry', (Date.now() + 3600 * 1000).toString());
    
    return {
      sucesso: true,
      token,
      expiraEm: 3600,
      mensagem: 'Autorização concluída com sucesso'
    };
    
  } catch (error: any) {
    console.error('Erro ao processar callback de autorização:', error);
    toast({
      title: 'Erro na autorização',
      description: error.message || 'Não foi possível completar o processo de autorização',
      variant: 'destructive'
    });
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processamento da autorização'
    };
  }
}

// Funções auxiliares

// Valida código de barras com base no tipo de documento
function validarCodigoBarras(codigo: string, tipo: string): boolean {
  // Em uma implementação real, teríamos validações específicas para cada tipo
  // de código de barras seguindo as regulamentações FEBRABAN
  
  // Implementação simplificada para demonstração:
  if (!codigo || codigo.length < 10) return false;
  
  switch (tipo) {
    case 'DARF':
    case 'GPS':
    case 'DAS':
      return codigo.length === 48 || codigo.length === 47;
    case 'Boleto':
      return codigo.length === 47 || codigo.length === 48;
    default:
      return codigo.length >= 44 && /^\d+$/.test(codigo.replace(/[^0-9]/g, ''));
  }
}

// Verifica status atual do token
export function verificarStatusToken(): TokenStatus {
  const token = localStorage.getItem('openbanking_token');
  const expiry = localStorage.getItem('openbanking_token_expiry');
  
  if (!token) return 'nao_autorizado';
  
  if (expiry && parseInt(expiry) < Date.now()) {
    return 'expirado';
  }
  
  return 'autorizado';
}
