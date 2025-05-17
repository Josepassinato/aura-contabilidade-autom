
import { EmailOptions, EmailResult, TemplateParams } from './types';
import { sendEmail } from './sendEmail';
import { getEmailTemplate } from './templateService';

// Function to send an email using a template
export async function sendTemplateEmail(
  templateId: string,
  templateParams: TemplateParams,
  options: EmailOptions
): Promise<EmailResult> {
  try {
    // Get the template content
    const template = await getEmailTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    // Replace template variables with actual values
    let parsedContent = template.content;
    
    // Process each template variable
    template.variables.forEach(variable => {
      const value = templateParams[variable] || '';
      const placeholder = `{{${variable}}}`;
      
      // Replace all occurrences of the placeholder with the actual value
      while (parsedContent.includes(placeholder)) {
        parsedContent = parsedContent.replace(placeholder, value);
      }
    });
    
    // Create email data for sending
    const emailData = {
      ...options,
      body: parsedContent,
      isHtml: true
    };
    
    // Send the email using the updated sendEmail function
    return await sendEmail(emailData);
  } catch (error: any) {
    console.error(`Error sending template email (${templateId}):`, error);
    return { success: false, error };
  }
}
