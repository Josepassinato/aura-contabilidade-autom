
import { useState } from 'react';

interface UseCommandProcessorProps {
  handleProcessCommand: (command: string) => void;
  addBotResponse: (text: string) => void;
  handleReportRequest: (reportType: string, originalCommand: string) => void;
  isAdmin: boolean;
  openAIConfigured: boolean;
  config?: any;
}

export function useCommandProcessor({ 
  handleProcessCommand, 
  addBotResponse,
  handleReportRequest,
  isAdmin,
  openAIConfigured,
  config
}: UseCommandProcessorProps) {
  const [manualInput, setManualInput] = useState('');

  const processWithReportDetection = (input: string) => {
    // Se OpenAI não estiver configurada e usuário não for admin, mostrar mensagem
    if (!openAIConfigured && !isAdmin) {
      addBotResponse("O assistente de voz não está configurado. Por favor, entre em contato com um administrador.");
      return;
    }
    
    // Se OpenAI não estiver configurada mas é admin, sugere configurar
    if (!openAIConfigured && isAdmin) {
      addBotResponse("O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.");
      return;
    }

    // Detectar solicitações de relatórios
    const reportKeywords = [
      'relatório',
      'relatorio',
      'gerar relatório',
      'enviar relatório',
      'me envie o relatório',
      'preciso do relatório',
      'gerar um pdf'
    ];

    const reportTypes = [
      'faturamento',
      'despesas',
      'balanço',
      'balanco',
      'dre',
      'fluxo de caixa',
      'obrigações fiscais',
      'obrigacoes fiscais',
      'folha de pagamento',
      'impostos'
    ];

    // Verificar se é uma solicitação de relatório
    const isReportRequest = reportKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Identificar o tipo de relatório
    let reportType = '';
    if (isReportRequest) {
      for (const type of reportTypes) {
        if (input.toLowerCase().includes(type.toLowerCase())) {
          reportType = type;
          break;
        }
      }
    }

    // Se for uma solicitação de relatório e tivermos um tipo identificado
    if (isReportRequest && reportType && config?.permitirRelatorios) {
      handleReportRequest(reportType, input);
      return;
    }

    // Caso não seja um relatório, processamos normalmente
    handleProcessCommand(input);
  };

  return {
    manualInput,
    setManualInput,
    processWithReportDetection
  };
}
