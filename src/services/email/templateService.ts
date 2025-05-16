
import { EmailTemplate, TemplateParams } from './types';

// Função para buscar templates de email
export async function getEmailTemplate(templateName: string): Promise<EmailTemplate | null> {
  // Simulação de busca de template
  const templates: Record<string, EmailTemplate> = {
    'welcome': {
      id: '1',
      name: 'welcome',
      subject: 'Bem-vindo ao Contaflix',
      content: `
        <h1>Olá {{nome}},</h1>
        <p>Bem-vindo ao Contaflix!</p>
        <p>Sua conta foi criada com sucesso em {{dataRegistro}}.</p>
        <p>Entre em contato caso precise de ajuda!</p>
      `,
      variables: ['nome', 'dataRegistro']
    },
    'report': {
      id: '2',
      name: 'report',
      subject: 'Seu relatório está pronto',
      content: `
        <h1>Relatório: {{reportName}}</h1>
        <p>Olá {{nome}},</p>
        <p>Seu relatório de {{reportType}} está pronto.</p>
        <p>Acesse o portal para visualizar.</p>
      `,
      variables: ['nome', 'reportName', 'reportType']
    }
  };
  
  return templates[templateName] || null;
}

// Função para processar templates com variáveis
export function processTemplate(template: EmailTemplate, params: TemplateParams): string {
  let processedContent = template.content;
  
  // Substituir variáveis no conteúdo do template
  Object.entries(params).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, String(value));
  });
  
  return processedContent;
}
