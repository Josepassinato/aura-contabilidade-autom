
// Arquivo principal que reexporta todas as funções
// Este arquivo servirá como ponto de entrada para o serviço de email

// Exportações de tipos
export type {
  EmailData,
  EmailOptions,
  EmailResult,
  EmailTemplate,
  ScheduleEmailResult,
  TemplateParams
} from './types';

// Exportações de funções
export { sendEmail } from './sendEmail';
export { sendNotificationEmail } from './sendEmail';
export { sendTemplateEmail } from './templateEmailService';
export { scheduleEmail } from './scheduleEmailService';
export { getEmailTemplate } from './templateService';
export { createEmailFunctionClient } from './supabaseEmailClient';
