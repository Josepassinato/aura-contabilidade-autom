
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailSubjectFieldProps {
  subject: string;
  onSubjectChange: (value: string) => void;
}

const EmailSubjectField: React.FC<EmailSubjectFieldProps> = ({
  subject,
  onSubjectChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="subject">Assunto</Label>
      <Input 
        id="subject" 
        placeholder="Assunto do email" 
        value={subject} 
        onChange={e => onSubjectChange(e.target.value)} 
      />
    </div>
  );
};

export default EmailSubjectField;
