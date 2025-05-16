
import React from 'react';
import { Mail } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const EmailHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Enviar Email
      </CardTitle>
      <CardDescription>
        Preencha os campos para enviar um email
      </CardDescription>
    </CardHeader>
  );
};

export default EmailHeader;
