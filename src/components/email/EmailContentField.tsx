
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface EmailContentFieldProps {
  body: string;
  isHtml: boolean;
  onBodyChange: (value: string) => void;
  onIsHtmlChange: (checked: boolean) => void;
}

const EmailContentField: React.FC<EmailContentFieldProps> = ({
  body,
  isHtml,
  onBodyChange,
  onIsHtmlChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="body">Conteúdo</Label>
        <Textarea 
          id="body" 
          placeholder="Conteúdo do email" 
          value={body} 
          onChange={e => onBodyChange(e.target.value)} 
          className="min-h-[150px]"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="html-format" 
          checked={isHtml} 
          onCheckedChange={(checked) => onIsHtmlChange(!!checked)}
        />
        <Label htmlFor="html-format">Formato HTML</Label>
      </div>
    </>
  );
};

export default EmailContentField;
