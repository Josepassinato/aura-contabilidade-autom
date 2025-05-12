
import { toast } from '@/hooks/use-toast';
import { obterSaldo, realizarPagamento, BankCredentials } from './openBankingService';

// Interface para um pagamento
export interface Pagamento {
  id: string;
  tipo: 'DARF' | 'GPS' | 'FGTS' | 'OUTROS';
  codigoBarras: string;
  valor: number;
  descricao: string;
  beneficiario: string;
  cnpjCpfBeneficiario?: string;
  dataVencimento: string;
  dataPagamento: string;
  status: 'agendado' | 'pago' | 'cancelado' | 'erro';
  competencia?: string;
  codigoReceita?: string;
  bancoPagamento?: string;
  contaPagamento?: string;
  comprovante?: string;
  mensagemRetorno?: string;
}

/**
 * Obtém os pagamentos armazenados
 */
export const obterPagamentos = (): Pagamento[] => {
  try {
    const pagamentosArmazenados = localStorage.getItem('pagamentos');
    if (!pagamentosArmazenados) {
      return [];
    }
    
    return JSON.parse(pagamentosArmazenados);
  } catch (error) {
    console.error('Erro ao obter pagamentos:', error);
    return [];
  }
};

/**
 * Salva os pagamentos no localStorage
 */
const salvarPagamentos = (pagamentos: Pagamento[]): void => {
  try {
    localStorage.setItem('pagamentos', JSON.stringify(pagamentos));
  } catch (error) {
    console.error('Erro ao salvar pagamentos:', error);
  }
};

/**
 * Gera um ID único para o pagamento
 */
const gerarIdPagamento = (): string => {
  return `pag-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Verifica se o valor do pagamento é válido
 */
const validarValorPagamento = (valor: number, saldoDisponivel: number): boolean => {
  if (valor <= 0) {
    toast({
      title: 'Valor inválido',
      description: 'O valor do pagamento deve ser maior que zero',
      variant: 'destructive'
    });
    return false;
  }
  
  if (valor > saldoDisponivel) {
    toast({
      title: 'Saldo insuficiente',
      description: `O valor do pagamento (R$ ${valor.toFixed(2)}) é maior que o saldo disponível (R$ ${saldoDisponivel.toFixed(2)})`,
      variant: 'destructive'
    });
    return false;
  }
  
  return true;
};

/**
 * Verifica se o código de barras é válido
 */
const validarCodigoBarras = (codigoBarras: string): boolean => {
  // Remover espaços e caracteres não numéricos
  const codigo = codigoBarras.replace(/\D/g, '');
  
  // Verificar se o código está no formato adequado
  // Códigos de barras de boletos normalmente têm 44 ou 47 dígitos
  if (codigo.length !== 44 && codigo.length !== 47) {
    toast({
      title: 'Código de barras inválido',
      description: 'O código de barras deve ter 44 ou 47 dígitos',
      variant: 'destructive'
    });
    return false;
  }
  
  return true;
};

/**
 * Agenda um novo pagamento
 */
export const agendarPagamento = async (
  credenciais: BankCredentials,
  dadosPagamento: Omit<Pagamento, 'id' | 'status' | 'comprovante' | 'mensagemRetorno' | 'bancoPagamento' | 'contaPagamento'>
): Promise<{success: boolean, pagamentoId?: string, mensagem?: string}> => {
  try {
    console.log('Agendando pagamento:', dadosPagamento);
    
    // Verificar saldo
    const saldoInfo = await obterSaldo(credenciais);
    if (!saldoInfo) {
      throw new Error('Não foi possível obter o saldo. Verifique suas credenciais bancárias.');
    }
    
    const saldoDisponivel = saldoInfo.saldoDisponivel;
    
    // Validar valor
    if (!validarValorPagamento(dadosPagamento.valor, saldoDisponivel)) {
      return { success: false, mensagem: 'Valor de pagamento inválido' };
    }
    
    // Validar código de barras
    if (!validarCodigoBarras(dadosPagamento.codigoBarras)) {
      return { success: false, mensagem: 'Código de barras inválido' };
    }
    
    // Realizar o pagamento através da API do banco
    const resultadoPagamento = await realizarPagamento(
      credenciais,
      dadosPagamento.codigoBarras,
      dadosPagamento.valor,
      dadosPagamento.dataVencimento,
      dadosPagamento.dataPagamento
    );
    
    if (!resultadoPagamento.sucesso) {
      return { 
        success: false,
        mensagem: resultadoPagamento.mensagem || 'Falha ao processar pagamento'
      };
    }
    
    // Criar registro de pagamento
    const novoPagamento: Pagamento = {
      ...dadosPagamento,
      id: gerarIdPagamento(),
      status: 'agendado',
      bancoPagamento: credenciais.banco,
      contaPagamento: `${credenciais.agencia}/${credenciais.conta}`,
      mensagemRetorno: resultadoPagamento.mensagem
    };
    
    // Salvar o pagamento na lista
    const pagamentos = obterPagamentos();
    pagamentos.push(novoPagamento);
    salvarPagamentos(pagamentos);
    
    toast({
      title: 'Pagamento agendado',
      description: `Pagamento de R$ ${dadosPagamento.valor.toFixed(2)} agendado com sucesso para ${new Date(dadosPagamento.dataPagamento).toLocaleDateString('pt-BR')}`,
    });
    
    return { 
      success: true, 
      pagamentoId: novoPagamento.id,
      mensagem: resultadoPagamento.mensagem || 'Pagamento agendado com sucesso' 
    };
  } catch (error: any) {
    console.error('Erro ao agendar pagamento:', error);
    toast({
      title: 'Erro ao agendar pagamento',
      description: error.message || 'Não foi possível agendar o pagamento',
      variant: 'destructive'
    });
    
    return { 
      success: false, 
      mensagem: error.message || 'Ocorreu um erro ao agendar o pagamento'
    };
  }
};

/**
 * Cancela um pagamento agendado
 */
export const cancelarPagamento = (id: string): boolean => {
  try {
    const pagamentos = obterPagamentos();
    const pagamentoIndex = pagamentos.findIndex(p => p.id === id);
    
    if (pagamentoIndex === -1) {
      toast({
        title: 'Pagamento não encontrado',
        description: 'Não foi possível encontrar o pagamento especificado',
        variant: 'destructive'
      });
      return false;
    }
    
    // Verificar se o pagamento já foi realizado
    if (pagamentos[pagamentoIndex].status === 'pago') {
      toast({
        title: 'Pagamento já realizado',
        description: 'Não é possível cancelar um pagamento já realizado',
        variant: 'destructive'
      });
      return false;
    }
    
    // Atualizar status do pagamento
    pagamentos[pagamentoIndex] = {
      ...pagamentos[pagamentoIndex],
      status: 'cancelado'
    };
    
    salvarPagamentos(pagamentos);
    
    toast({
      title: 'Pagamento cancelado',
      description: 'O agendamento de pagamento foi cancelado com sucesso'
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    toast({
      title: 'Erro ao cancelar pagamento',
      description: 'Não foi possível cancelar o pagamento',
      variant: 'destructive'
    });
    
    return false;
  }
};

/**
 * Obtém o status atualizado de um pagamento
 */
export const verificarStatusPagamento = async (
  credenciais: BankCredentials,
  pagamentoId: string
): Promise<Pagamento | null> => {
  try {
    const pagamentos = obterPagamentos();
    const pagamentoIndex = pagamentos.findIndex(p => p.id === pagamentoId);
    
    if (pagamentoIndex === -1) {
      return null;
    }
    
    const pagamento = pagamentos[pagamentoIndex];
    
    // Em uma implementação real, aqui consultaríamos a API do banco
    // para verificar o status atual do pagamento
    // Como estamos simulando, vamos verificar a data de pagamento
    
    const dataPagamento = new Date(pagamento.dataPagamento);
    const hoje = new Date();
    
    // Se a data de pagamento já passou, considerar o pagamento como realizado
    if (dataPagamento <= hoje && pagamento.status === 'agendado') {
      // Atualizar status
      pagamentos[pagamentoIndex] = {
        ...pagamentos[pagamentoIndex],
        status: 'pago',
        comprovante: `COMP${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      };
      
      salvarPagamentos(pagamentos);
      
      toast({
        title: 'Pagamento realizado',
        description: `O pagamento de R$ ${pagamento.valor.toFixed(2)} foi realizado com sucesso`
      });
    }
    
    return pagamentos[pagamentoIndex];
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return null;
  }
};

/**
 * Gera um comprovante de pagamento (simulação)
 */
export const gerarComprovantePagamento = (pagamento: Pagamento): Blob => {
  try {
    // Em uma implementação real, geraria um PDF com o comprovante
    // Como é uma simulação, vamos criar um texto
    const conteudo = `
COMPROVANTE DE PAGAMENTO
------------------------
ID Transação: ${pagamento.comprovante || pagamento.id}
Data/hora: ${new Date().toLocaleString('pt-BR')}
Valor: R$ ${pagamento.valor.toFixed(2)}
Beneficiário: ${pagamento.beneficiario}
Documento: ${pagamento.cnpjCpfBeneficiario || 'Não informado'}
Tipo de pagamento: ${pagamento.tipo}
Data de vencimento: ${new Date(pagamento.dataVencimento).toLocaleDateString('pt-BR')}
Data do pagamento: ${new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR')}
Banco: ${pagamento.bancoPagamento || 'Não informado'}
Conta: ${pagamento.contaPagamento || 'Não informado'}
Status: ${pagamento.status.toUpperCase()}
`;
    
    return new Blob([conteudo], { type: 'text/plain' });
  } catch (error) {
    console.error('Erro ao gerar comprovante:', error);
    throw error;
  }
};
