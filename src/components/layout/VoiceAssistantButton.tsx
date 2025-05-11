
import React from 'react';
import { Mic } from "lucide-react";

interface VoiceAssistantButtonProps {
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function VoiceAssistantButton({ isActive, onClick, className = "" }: VoiceAssistantButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-full flex items-center gap-2 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'} ${className}`}
      aria-label="Assistente de Voz"
      title="Ativar/Desativar Assistente de Voz"
    >
      <Mic className="h-5 w-5" />
      {className.includes('md:flex') && <span>Assistente de Voz</span>}
    </button>
  );
}

export default VoiceAssistantButton;
