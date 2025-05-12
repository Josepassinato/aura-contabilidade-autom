
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Tipos de relatórios disponíveis
export type TipoRelatorio = 
  | 'balanco' 
  | 'dre' 
  | 'fluxo-caixa' 
  | 'obrigacoes-fiscais' 
  | 'guias-pagamento'
  | 'folha-pagamento'
  | 'certidoes';

// Interface para dados de relatório genérico
export interface DadosRelatorio {
  titulo: string;
  subtitulo?: string;
  periodo?: {
    inicio: string;
    fim: string;
  };
  empresa: {
    nome: string;
    cnpj: string;
    endereco?: string;
  };
  data: Array<{[key: string]: any}>;
  colunas: Array<{
    cabecalho: string;
    chave: string;
    alinhamento?: 'left' | 'center' | 'right';
    formatador?: (valor: any) => string;
  }>;
  totalizadores?: Array<{
    rotulo: string;
    valor: number | string;
  }>;
}

// Interface para opções de geração do PDF
export interface OpcoesPDF {
  orientacao?: 'portrait' | 'landscape';
  tamanhoFonte?: number;
  incluirLogotipo?: boolean;
  incluirRodape?: boolean;
  incluirNumeracao?: boolean;
  incluirDataGeracao?: boolean;
  colorido?: boolean;
  tamanho?: 'A4' | 'letter' | 'legal';
}

// Interface para opções de email
export interface OpcoesEmail {
  destinatarios: string[];
  assunto?: string;
  corpoEmail?: string;
  copias?: string[];
  copiasOcultas?: string[];
}

/**
 * Função para formatar valores monetários
 */
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor);
};

/**
 * Função para formatar datas
 */
export const formatarData = (data: string): string => {
  const date = new Date(data);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

/**
 * Gera um documento PDF baseado nos dados fornecidos
 */
export const gerarPDF = (dados: DadosRelatorio, opcoes: OpcoesPDF = {}): Blob => {
  try {
    // Configurar opções padrão
    const {
      orientacao = 'portrait',
      tamanhoFonte = 10,
      incluirLogotipo = true,
      incluirRodape = true,
      incluirNumeracao = true,
      incluirDataGeracao = true,
      colorido = true,
      tamanho = 'A4'
    } = opcoes;
    
    // Criar documento PDF
    const doc = new jsPDF({
      orientation: orientacao,
      unit: 'mm',
      format: tamanho
    });
    
    // Definir estilos
    const corPrimaria = colorido ? '#2563eb' : '#333333';
    const corSecundaria = colorido ? '#6b7280' : '#666666';
    
    // Adicionar logotipo (simulação)
    if (incluirLogotipo) {
      // Em uma implementação real, aqui adicionaríamos uma imagem
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(corPrimaria);
      doc.text('CONTAFLIX', 14, 20);
    }
    
    // Adicionar cabeçalho do relatório
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(tamanhoFonte + 6);
    doc.setTextColor(corPrimaria);
    doc.text(dados.titulo, 14, 35);
    
    if (dados.subtitulo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(tamanhoFonte + 2);
      doc.setTextColor(corSecundaria);
      doc.text(dados.subtitulo, 14, 42);
    }
    
    // Adicionar informações da empresa
    doc.setFontSize(tamanhoFonte);
    doc.setFont('helvetica', 'bold');
    doc.text(`Empresa: ${dados.empresa.nome}`, 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNPJ: ${dados.empresa.cnpj}`, 14, 55);
    
    if (dados.empresa.endereco) {
      doc.text(`Endereço: ${dados.empresa.endereco}`, 14, 60);
    }
    
    // Adicionar período do relatório
    if (dados.periodo) {
      doc.text(`Período: ${formatarData(dados.periodo.inicio)} a ${formatarData(dados.periodo.fim)}`, 14, 65);
    }
    
    // Adicionar data de geração
    if (incluirDataGeracao) {
      const dataGeracao = new Date();
      const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dataGeracao);
      doc.text(`Gerado em: ${dataFormatada}`, 14, 70);
    }
    
    // Criar tabela com dados
    const tabela = dados.data.map(item => {
      return dados.colunas.map(coluna => {
        const valor = item[coluna.chave];
        return coluna.formatador ? coluna.formatador(valor) : valor;
      });
    });
    
    // Configurar cabeçalho da tabela
    const cabecalhos = dados.colunas.map(coluna => coluna.cabecalho);
    
    // Configurar alinhamento das colunas
    const alinhamentos = dados.colunas.map(coluna => coluna.alinhamento || 'left');
    
    // Adicionar tabela ao documento
    (doc as any).autoTable({
      head: [cabecalhos],
      body: tabela,
      startY: 80,
      styles: { fontSize: tamanhoFonte, cellPadding: 3 },
      columnStyles: alinhamentos.reduce((acc, align, index) => {
        acc[index] = { halign: align };
        return acc;
      }, {} as any),
      headStyles: { fillColor: colorido ? [37, 99, 235] : [80, 80, 80] }
    });
    
    // Adicionar totalizadores
    if (dados.totalizadores && dados.totalizadores.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      dados.totalizadores.forEach((total, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${total.rotulo}: `, 14, finalY + (index * 6));
        doc.setFont('helvetica', 'normal');
        doc.text(total.valor.toString(), 45, finalY + (index * 6));
      });
    }
    
    // Adicionar rodapé
    if (incluirRodape) {
      const totalPaginas = doc.getNumberOfPages();
      
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(corSecundaria);
        
        // Rodapé
        doc.text('Documento gerado pelo sistema Contaflix - Contabilidade Digital', 14, doc.internal.pageSize.height - 10);
        
        // Numeração de página
        if (incluirNumeracao) {
          doc.text(`Página ${i} de ${totalPaginas}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
      }
    }
    
    // Retornar o documento como Blob
    return doc.output('blob');
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast({
      title: 'Erro ao gerar PDF',
      description: 'Não foi possível gerar o documento PDF',
      variant: 'destructive'
    });
    
    // Retornar um PDF vazio com mensagem de erro em caso de falha
    const errorDoc = new jsPDF();
    errorDoc.text('Erro ao gerar relatório', 10, 10);
    return errorDoc.output('blob');
  }
};

/**
 * Envia um email com o relatório anexado
 * Esta é uma simulação, em produção seria utilizado um serviço como SendGrid, AWS SES, etc.
 */
export const enviarRelatorioPorEmail = async (
  pdf: Blob,
  nomeArquivo: string,
  opcoes: OpcoesEmail
): Promise<{success: boolean, message?: string}> => {
  try {
    console.log('Enviando relatório por email...');
    console.log('Destinatários:', opcoes.destinatarios.join(', '));
    console.log('Assunto:', opcoes.assunto || 'Relatório Contaflix');
    
    // Simulação de envio de email 
    // Em produção, aqui seria integrado um serviço de email real
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log de sucesso
    console.log(`Email enviado com sucesso para ${opcoes.destinatarios.length} destinatários`);
    
    // Notificar o usuário
    toast({
      title: 'Email enviado',
      description: `Relatório enviado com sucesso para ${opcoes.destinatarios.length} destinatários`,
    });
    
    return {
      success: true,
      message: `Email enviado com sucesso para ${opcoes.destinatarios.join(', ')}`
    };
    
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    
    toast({
      title: 'Erro ao enviar email',
      description: error.message || 'Não foi possível enviar o email com o relatório',
      variant: 'destructive'
    });
    
    return {
      success: false,
      message: error.message || 'Erro ao enviar email'
    };
  }
};

/**
 * Cria um link de compartilhamento para o relatório
 */
export const criarLinkCompartilhamento = (
  tipoRelatorio: TipoRelatorio, 
  parametros: {[key: string]: string}
): string => {
  // Em uma implementação real, geraríamos um link seguro com um token
  // e salvaríamos os parâmetros no backend
  
  // Gerar um ID único para o relatório
  const relatorioId = `rel-${Math.random().toString(36).substring(2, 10)}`;
  
  // Criar um objeto com os parâmetros
  const dadosCompartilhamento = {
    id: relatorioId,
    tipo: tipoRelatorio,
    parametros,
    dataExpiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expira em 7 dias
    criado: new Date().toISOString()
  };
  
  // Salvar no localStorage para simulação (no backend real seria um banco de dados)
  const compartilhamentos = JSON.parse(localStorage.getItem('compartilhamentos') || '{}');
  compartilhamentos[relatorioId] = dadosCompartilhamento;
  localStorage.setItem('compartilhamentos', JSON.stringify(compartilhamentos));
  
  // Retornar um link para o relatório
  return `${window.location.origin}/relatorio-compartilhado/${relatorioId}`;
};

/**
 * Atalho para gerar e enviar um relatório por email
 */
export const gerarEEnviarRelatorio = async (
  dados: DadosRelatorio, 
  opcoesPDF: OpcoesPDF = {},
  opcoesEmail: OpcoesEmail
): Promise<{success: boolean, message?: string}> => {
  try {
    // Gerar o PDF
    const pdf = gerarPDF(dados, opcoesPDF);
    
    // Criar nome de arquivo
    const nomeArquivo = `${dados.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Enviar por email
    return await enviarRelatorioPorEmail(pdf, nomeArquivo, opcoesEmail);
  } catch (error: any) {
    console.error('Erro ao gerar e enviar relatório:', error);
    return {
      success: false,
      message: error.message || 'Erro ao gerar e enviar relatório'
    };
  }
};
