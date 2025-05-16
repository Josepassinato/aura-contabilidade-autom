
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EmailFooterProps {
  onSendClick: () => void;
  isLoading: boolean;
}

const EmailFooter: React.FC<EmailFooterProps> = ({ onSendClick, isLoading }) => {
  return (
    <>
      <Separator />
      <CardFooter className="pt-4">
        <Button 
          className="w-full" 
          onClick={onSendClick} 
          disabled={isLoading}
        >
          <Send className="w-4 h-4 mr-2" /> 
          {isLoading ? 'Enviando...' : 'Enviar Email'}
        </Button>
      </CardFooter>
    </>
  );
};

export default EmailFooter;
