
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useEmailSender } from "@/hooks/useEmailSender";
import EmailHeader from './EmailHeader';
import EmailTemplateSelector from './EmailTemplateSelector';
import EmailRecipientFields from './EmailRecipientFields';
import EmailSubjectField from './EmailSubjectField';
import EmailTemplateForm from './EmailTemplateForm';
import EmailContentField from './EmailContentField';
import EmailFooter from './EmailFooter';

interface EmailSenderProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  enableTemplates?: boolean;
  onSendComplete?: (success: boolean) => void;
  className?: string;
}

export function EmailSender({
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  enableTemplates = false,
  onSendComplete,
  className = ''
}: EmailSenderProps) {
  const {
    to, setTo,
    cc, setCc,
    bcc, setBcc,
    subject, setSubject,
    body, setBody,
    isHtml, setIsHtml,
    showCcBcc, setShowCcBcc,
    isLoading,
    selectedTemplate, setSelectedTemplate,
    templateData, updateTemplateData,
    getTemplateFields, handleSendEmail
  } = useEmailSender({
    defaultTo,
    defaultSubject,
    defaultBody,
    enableTemplates,
    onSendComplete
  });

  return (
    <Card className={className}>
      <EmailHeader />
      
      <CardContent className="space-y-4">
        {enableTemplates && (
          <EmailTemplateSelector 
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate} 
          />
        )}
        
        <EmailRecipientFields 
          to={to}
          cc={cc}
          bcc={bcc}
          showCcBcc={showCcBcc}
          onToChange={setTo}
          onCcChange={setCc}
          onBccChange={setBcc}
          onToggleCcBcc={() => setShowCcBcc(!showCcBcc)}
        />
        
        <EmailSubjectField 
          subject={subject}
          onSubjectChange={setSubject}
        />
        
        {selectedTemplate && selectedTemplate !== 'custom' && enableTemplates ? (
          <EmailTemplateForm 
            fields={getTemplateFields()}
            templateData={templateData}
            onUpdateTemplateData={updateTemplateData}
          />
        ) : (
          <EmailContentField 
            body={body}
            isHtml={isHtml}
            onBodyChange={setBody}
            onIsHtmlChange={setIsHtml}
          />
        )}
      </CardContent>
      
      <EmailFooter 
        onSendClick={handleSendEmail}
        isLoading={isLoading}
      />
    </Card>
  );
}

export default EmailSender;
