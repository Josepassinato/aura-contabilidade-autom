import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import React from 'react';

// Configurações de toast personalizadas
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  closeButton: true,
};

// Toast de sucesso
export const successToast = (message: string, description?: string) => {
  sonnerToast.success(message, {
    ...toastConfig,
    description,
    icon: React.createElement(CheckCircle, { className: 'h-4 w-4' }),
  });
};

// Toast de erro
export const errorToast = (message: string, description?: string) => {
  sonnerToast.error(message, {
    ...toastConfig,
    description,
    icon: React.createElement(XCircle, { className: 'h-4 w-4' }),
    duration: 6000, // Mais tempo para erros
  });
};

// Toast de aviso
export const warningToast = (message: string, description?: string) => {
  sonnerToast.warning(message, {
    ...toastConfig,
    description,
    icon: React.createElement(AlertTriangle, { className: 'h-4 w-4' }),
  });
};

// Toast de informação
export const infoToast = (message: string, description?: string) => {
  sonnerToast.info(message, {
    ...toastConfig,
    description,
    icon: React.createElement(Info, { className: 'h-4 w-4' }),
  });
};

// Toast de loading
export const loadingToast = (message: string) => {
  return sonnerToast.loading(message, {
    ...toastConfig,
    icon: React.createElement(Loader2, { className: 'h-4 w-4 animate-spin' }),
    duration: Infinity, // Não remove automaticamente
  });
};

// Toast de progresso
export const progressToast = (message: string, progress: number) => {
  return sonnerToast.loading(`${message} (${progress}%)`, {
    ...toastConfig,
    icon: React.createElement(Loader2, { className: 'h-4 w-4 animate-spin' }),
    duration: Infinity,
  });
};

// Mensagens de erro amigáveis pré-definidas
export const friendlyErrorMessages = {
  network: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
  timeout: 'A operação demorou mais que o esperado. Tente novamente.',
  unauthorized: 'Sua sessão expirou. Faça login novamente.',
  forbidden: 'Você não tem permissão para realizar esta ação.',
  notFound: 'O item solicitado não foi encontrado.',
  validation: 'Alguns campos não foram preenchidos corretamente.',
  server: 'Ocorreu um erro interno. Nossa equipe foi notificada.',
  unknown: 'Algo deu errado. Tente novamente em alguns instantes.',
};

// Função helper para mostrar erros amigáveis
export const showFriendlyError = (error: any) => {
  let message = friendlyErrorMessages.unknown;
  let description = '';

  if (error?.response?.status) {
    switch (error.response.status) {
      case 401:
        message = friendlyErrorMessages.unauthorized;
        break;
      case 403:
        message = friendlyErrorMessages.forbidden;
        break;
      case 404:
        message = friendlyErrorMessages.notFound;
        break;
      case 422:
        message = friendlyErrorMessages.validation;
        description = error.response.data?.message || '';
        break;
      case 500:
        message = friendlyErrorMessages.server;
        break;
      default:
        message = friendlyErrorMessages.unknown;
    }
  } else if (error?.code === 'NETWORK_ERROR') {
    message = friendlyErrorMessages.network;
  } else if (error?.code === 'TIMEOUT') {
    message = friendlyErrorMessages.timeout;
  }

  errorToast(message, description);
};

// Toasts para ações específicas
export const actionToasts = {
  save: {
    loading: () => loadingToast('Salvando...'),
    success: () => successToast('Salvo com sucesso!'),
    error: () => showFriendlyError({ response: { status: 500 } }),
  },
  delete: {
    loading: () => loadingToast('Excluindo...'),
    success: (item: string) => successToast(`${item} excluído com sucesso!`),
    error: () => showFriendlyError({ response: { status: 500 } }),
  },
  upload: {
    loading: () => loadingToast('Enviando arquivo...'),
    progress: (progress: number) => progressToast('Enviando arquivo', progress),
    success: () => successToast('Arquivo enviado com sucesso!'),
    error: () => showFriendlyError({ response: { status: 500 } }),
  },
  login: {
    loading: () => loadingToast('Fazendo login...'),
    success: () => successToast('Login realizado com sucesso!'),
    error: (message?: string) => errorToast('Erro no login', message || 'Verifique suas credenciais.'),
  },
};

// Função para remover toast específico
export const dismissToast = (toastId: string | number) => {
  sonnerToast.dismiss(toastId);
};