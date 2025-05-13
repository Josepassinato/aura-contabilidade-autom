
import React from 'react';
import { Link } from "react-router-dom";

interface ConfigWarningProps {
  openAIConfigured: boolean;
  isAdmin: boolean;
}

export function ConfigWarning({ openAIConfigured, isAdmin }: ConfigWarningProps) {
  if (openAIConfigured) return null;
  
  return (
    <div className="p-3 bg-yellow-50 border-b text-sm">
      {isAdmin ? (
        <p>O assistente de voz precisa de configuração. Por favor, configure a API OpenAI nas <Link to="/settings?openai=true" className="text-primary underline">configurações</Link>.</p>
      ) : (
        <p>O assistente de voz não está configurado. Por favor, entre em contato com um administrador.</p>
      )}
    </div>
  );
}
