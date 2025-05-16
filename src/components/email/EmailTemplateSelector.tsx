
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmailTemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateChange: (value: string) => void;
}

const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="template">Modelo de Email</Label>
      <Select
        value={selectedTemplate}
        onValueChange={onTemplateChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um modelo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="welcome">Boas-vindas</SelectItem>
          <SelectItem value="relatorio">Relatório</SelectItem>
          <SelectItem value="alerta">Alerta</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmailTemplateSelector;
