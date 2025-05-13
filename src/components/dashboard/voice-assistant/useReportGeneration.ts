
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface UseReportGenerationProps {
  addBotResponse: (text: string) => void;
  config?: any;
}

export function useReportGeneration({ addBotResponse, config }: UseReportGenerationProps) {
  const [reportGenerating, setReportGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    title: string;
    url: string;
    type: string;
  } | null>(null);

  const handleReportRequest = (reportType: string, originalCommand: string) => {
    setReportGenerating(true);
    
    // Informar que o relatório está sendo gerado
    addBotResponse(`Estou gerando o relatório de ${reportType} para você. Aguarde um momento...`);
    
    // Simular o tempo de geração do relatório
    setTimeout(() => {
      // Gerar um "relatório" simulado
      const reportUrl = `#report-${reportType.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      
      // Definir o relatório gerado
      setGeneratedReport({
        title: `Relatório de ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
        url: reportUrl,
        type: reportType
      });
      
      // Verificar se precisa enviar por e-mail
      const shouldSendEmail = originalCommand.toLowerCase().includes('enviar') || 
                             originalCommand.toLowerCase().includes('e-mail') ||
                             originalCommand.toLowerCase().includes('email');
      
      if (shouldSendEmail && config?.emailDestinoRelatorios) {
        // Simular envio do relatório por e-mail
        setTimeout(() => {
          addBotResponse(`Pronto! O relatório de ${reportType} foi gerado com sucesso e enviado para ${config.emailDestinoRelatorios}.`);
          
          toast({
            title: `Relatório enviado`,
            description: `O relatório foi enviado para ${config.emailDestinoRelatorios}`,
          });
        }, 1000);
      } else {
        // Se não for para enviar por e-mail, apenas informar que o relatório está pronto
        addBotResponse(`Pronto! O relatório de ${reportType} foi gerado com sucesso. Você pode baixá-lo clicando no botão abaixo.`);
      }
      
      setReportGenerating(false);
    }, 3000);
  };

  return {
    reportGenerating,
    generatedReport,
    setGeneratedReport,
    handleReportRequest
  };
}
