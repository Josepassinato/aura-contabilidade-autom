
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailTemplateFormProps {
  fields: string[];
  templateData: { [key: string]: string };
  onUpdateTemplateData: (field: string, value: string) => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  fields,
  templateData,
  onUpdateTemplateData
}) => {
  if (fields.length === 0) return null;
  
  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/30">
      <h4 className="text-sm font-medium">Dados do Modelo</h4>
      
      {fields.map(field => (
        <div key={field} className="space-y-2">
          <Label htmlFor={`template-${field}`} className="capitalize">
            {field.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())}
          </Label>
          <Input 
            id={`template-${field}`}
            value={templateData[field] || ''}
            onChange={e => onUpdateTemplateData(field, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default EmailTemplateForm;
