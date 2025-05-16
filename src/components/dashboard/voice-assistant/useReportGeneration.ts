
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { reportsService } from "@/services/relatorios/reportsService";

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
    id: string;
  } | null>(null);

  const handleReportRequest = async (reportType: string, originalCommand: string) => {
    setReportGenerating(true);
    
    // Informar que o relatório está sendo gerado
    addBotResponse(`Estou gerando o relatório de ${reportType} para você. Aguarde um momento...`);
    
    try {
      // Criar um conteúdo simulado para o relatório (em uma aplicação real, este seria o conteúdo real)
      const dummyContent = new Blob([`Relatório de ${reportType} - Conteúdo de exemplo`], { type: 'text/plain' });
      
      // Determinar o tipo de arquivo com base no tipo de relatório
      let fileFormat: 'pdf' | 'excel' | 'csv' = 'pdf';
      if (reportType.toLowerCase().includes('planilha') || reportType.toLowerCase().includes('excel')) {
        fileFormat = 'excel';
      } else if (reportType.toLowerCase().includes('csv') || reportType.toLowerCase().includes('dados')) {
        fileFormat = 'csv';
      }
      
      // Gerar um título para o relatório
      const reportTitle = `Relatório de ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`;
      
      // Gerar tags relevantes
      const tags = [
        reportType,
        fileFormat.toUpperCase(),
        'IA',
        'Gerado por Voz'
      ].filter(Boolean);
      
      // Criar o relatório no banco de dados
      const { data: report, error } = await reportsService.generateReport({
        title: reportTitle,
        description: `Relatório de ${reportType} gerado automaticamente via assistente de voz.`,
        report_type: reportType,
        client_id: config?.selectedClientId || undefined,
        file_format: fileFormat,
        content: dummyContent,
        tags
      });
      
      if (error) throw error;
      
      if (report) {
        // Definir o relatório gerado
        setGeneratedReport({
          title: report.title,
          url: report.file_url || '#',
          type: reportType,
          id: report.id
        });
        
        // Verificar se precisa enviar por e-mail
        const shouldSendEmail = originalCommand.toLowerCase().includes('enviar') || 
                             originalCommand.toLowerCase().includes('e-mail') ||
                             originalCommand.toLowerCase().includes('email');
        
        if (shouldSendEmail && config?.emailDestinoRelatorios) {
          // Simular envio do relatório por e-mail
          setTimeout(() => {
            addBotResponse(
              `Pronto! O relatório de ${reportType} foi gerado com sucesso e enviado para ${config.emailDestinoRelatorios}. ` +
              `Você também pode acessá-lo na seção de "Relatórios Salvos".`
            );
            
            toast({
              title: `Relatório enviado`,
              description: `O relatório foi enviado para ${config.emailDestinoRelatorios}`,
            });
          }, 1000);
        } else {
          // Se não for para enviar por e-mail, apenas informar que o relatório está pronto
          addBotResponse(
            `Pronto! O relatório de ${reportType} foi gerado com sucesso. ` +
            `Você pode baixá-lo clicando no botão abaixo ou acessá-lo a qualquer momento na seção de "Relatórios Salvos".`
          );
        }
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      addBotResponse(`Desculpe, ocorreu um erro ao gerar o relatório de ${reportType}. Por favor, tente novamente mais tarde.`);
      
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um problema durante a geração do relatório.",
        variant: "destructive"
      });
    } finally {
      setReportGenerating(false);
    }
  };

  return {
    reportGenerating,
    generatedReport,
    setGeneratedReport,
    handleReportRequest
  };
}
