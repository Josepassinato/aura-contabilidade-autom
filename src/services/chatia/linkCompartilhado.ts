
import { toast } from '@/hooks/use-toast';

// Interface para definir um link compartilhado
export interface LinkCompartilhado {
  id: string;
  clienteId: string;
  clienteNome: string;
  escritorioId: string;
  dataCriacao: string;
  dataExpiracao: string;
  acessos: number;
  ultimoAcesso?: string;
  permissoes: {
    acessoRelatorios: boolean;
    acessoGuias: boolean;
    acessoCertidoes: boolean;
    acessoDadosEmpresa: boolean;
  };
  ativo: boolean;
}

/**
 * Gera um ID único para o link
 */
const gerarId = (): string => {
  return `link-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Obtém todos os links compartilhados armazenados
 */
export const obterTodosLinks = (): LinkCompartilhado[] => {
  try {
    const linksArmazenados = localStorage.getItem('links_compartilhados');
    if (!linksArmazenados) {
      return [];
    }
    
    return JSON.parse(linksArmazenados);
  } catch (error) {
    console.error('Erro ao obter links compartilhados:', error);
    return [];
  }
};

/**
 * Salva os links compartilhados no localStorage
 */
const salvarLinks = (links: LinkCompartilhado[]): void => {
  try {
    localStorage.setItem('links_compartilhados', JSON.stringify(links));
  } catch (error) {
    console.error('Erro ao salvar links compartilhados:', error);
    toast({
      title: 'Erro ao salvar links',
      description: 'Não foi possível salvar os links compartilhados',
      variant: 'destructive'
    });
  }
};

/**
 * Cria um novo link compartilhado para um cliente
 */
export const criarLinkCompartilhado = (
  clienteId: string,
  clienteNome: string,
  escritorioId: string,
  diasValidade: number = 30,
  permissoes: {
    acessoRelatorios: boolean;
    acessoGuias: boolean;
    acessoCertidoes: boolean;
    acessoDadosEmpresa: boolean;
  } = {
    acessoRelatorios: true,
    acessoGuias: true,
    acessoCertidoes: true,
    acessoDadosEmpresa: true
  }
): LinkCompartilhado => {
  try {
    const id = gerarId();
    const dataCriacao = new Date().toISOString();
    const dataExpiracao = new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000).toISOString();
    
    const novoLink: LinkCompartilhado = {
      id,
      clienteId,
      clienteNome,
      escritorioId,
      dataCriacao,
      dataExpiracao,
      acessos: 0,
      permissoes,
      ativo: true
    };
    
    // Salvar o novo link
    const links = obterTodosLinks();
    links.push(novoLink);
    salvarLinks(links);
    
    console.log('Link compartilhado criado com sucesso:', novoLink);
    
    toast({
      title: 'Link criado com sucesso',
      description: `Link compartilhado para ${clienteNome} criado com sucesso`
    });
    
    return novoLink;
  } catch (error) {
    console.error('Erro ao criar link compartilhado:', error);
    toast({
      title: 'Erro ao criar link',
      description: 'Não foi possível criar o link compartilhado',
      variant: 'destructive'
    });
    
    throw error;
  }
};

/**
 * Verifica se um link compartilhado é válido
 */
export const verificarLinkValido = (id: string): boolean => {
  try {
    const links = obterTodosLinks();
    const link = links.find(l => l.id === id);
    
    if (!link) {
      return false;
    }
    
    // Verificar se está ativo
    if (!link.ativo) {
      return false;
    }
    
    // Verificar se não expirou
    const agora = new Date();
    const expiracao = new Date(link.dataExpiracao);
    
    return agora <= expiracao;
  } catch (error) {
    console.error('Erro ao verificar link compartilhado:', error);
    return false;
  }
};

/**
 * Obtém um link compartilhado pelo ID
 */
export const obterLink = (id: string): LinkCompartilhado | null => {
  try {
    const links = obterTodosLinks();
    return links.find(l => l.id === id) || null;
  } catch (error) {
    console.error('Erro ao obter link compartilhado:', error);
    return null;
  }
};

/**
 * Registra um acesso a um link compartilhado
 */
export const registrarAcesso = (id: string): boolean => {
  try {
    const links = obterTodosLinks();
    const linkIndex = links.findIndex(l => l.id === id);
    
    if (linkIndex === -1) {
      return false;
    }
    
    // Atualizar contagem de acessos e data do último acesso
    links[linkIndex] = {
      ...links[linkIndex],
      acessos: links[linkIndex].acessos + 1,
      ultimoAcesso: new Date().toISOString()
    };
    
    salvarLinks(links);
    return true;
  } catch (error) {
    console.error('Erro ao registrar acesso ao link compartilhado:', error);
    return false;
  }
};

/**
 * Desativa um link compartilhado
 */
export const desativarLink = (id: string): boolean => {
  try {
    const links = obterTodosLinks();
    const linkIndex = links.findIndex(l => l.id === id);
    
    if (linkIndex === -1) {
      return false;
    }
    
    // Desativar o link
    links[linkIndex] = {
      ...links[linkIndex],
      ativo: false
    };
    
    salvarLinks(links);
    
    toast({
      title: 'Link desativado',
      description: 'O link compartilhado foi desativado com sucesso'
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao desativar link compartilhado:', error);
    toast({
      title: 'Erro ao desativar link',
      description: 'Não foi possível desativar o link compartilhado',
      variant: 'destructive'
    });
    return false;
  }
};

/**
 * Gera uma URL completa para acesso ao chat IA
 */
export const gerarUrlChatIA = (id: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/client-chat/${id}`;
};
