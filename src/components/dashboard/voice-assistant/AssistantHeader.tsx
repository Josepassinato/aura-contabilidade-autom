
import React from 'react';
import { X, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface AssistantHeaderProps {
  isProcessing: boolean;
  isNlpProcessing: boolean;
  reportGenerating: boolean;
  config: any;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
  onToggle: () => void;
  openAIConfigured: boolean;
  isAdmin: boolean;
}

export function AssistantHeader({
  isProcessing,
  isNlpProcessing,
  reportGenerating,
  config,
  clientInfo,
  onToggle,
  openAIConfigured,
  isAdmin
}: AssistantHeaderProps) {
  return (
    <div className="p-4 flex justify-between items-center border-b">
      <div className="flex items-center gap-2">
        {isProcessing || isNlpProcessing || reportGenerating ? (
          <div className="h-5 w-5 rounded-full bg-primary animate-pulse"></div>
        ) : (
          <div className="h-5 w-5 text-primary">🎙️</div>
        )}
        <span className="font-medium">
          {config?.name || (clientInfo ? `${clientInfo.name} Assistant` : "Voice Assistant")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!openAIConfigured && isAdmin && (
          <Link 
            to="/settings?openai=true" 
            className="p-1 rounded-full hover:bg-muted text-primary"
            title="Configurar OpenAI"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
        <button onClick={onToggle} className="p-1 rounded-full hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
