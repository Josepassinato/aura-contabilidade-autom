
// Tipos comuns para o serviço de email
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

export interface EmailData {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: Array<{name: string, url: string}>;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailOptions extends EmailData {
  // EmailOptions must include all EmailData properties including body
}

export interface TemplateParams {
  [key: string]: any;
}

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: any;
}

export interface ScheduleEmailResult extends EmailResult {
  scheduledDate?: string;
}
