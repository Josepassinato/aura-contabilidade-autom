
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailRecipientFieldsProps {
  to: string;
  cc: string;
  bcc: string;
  showCcBcc: boolean;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onToggleCcBcc: () => void;
}

const EmailRecipientFields: React.FC<EmailRecipientFieldsProps> = ({
  to,
  cc,
  bcc,
  showCcBcc,
  onToChange,
  onCcChange,
  onBccChange,
  onToggleCcBcc
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="to">Para</Label>
        <Input 
          id="to" 
          placeholder="email@exemplo.com, outro@exemplo.com" 
          value={to} 
          onChange={e => onToChange(e.target.value)} 
        />
      </div>
      
      {showCcBcc && (
        <>
          <div className="space-y-2">
            <Label htmlFor="cc">Cc</Label>
            <Input 
              id="cc" 
              placeholder="cc@exemplo.com" 
              value={cc} 
              onChange={e => onCcChange(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bcc">Cco</Label>
            <Input 
              id="bcc" 
              placeholder="cco@exemplo.com" 
              value={bcc} 
              onChange={e => onBccChange(e.target.value)} 
            />
          </div>
        </>
      )}
      
      <div className="flex justify-end">
        <Button 
          variant="link" 
          className="text-xs py-0 h-auto" 
          onClick={onToggleCcBcc}
        >
          {showCcBcc ? 'Ocultar Cc/Cco' : 'Mostrar Cc/Cco'}
        </Button>
      </div>
    </>
  );
};

export default EmailRecipientFields;
