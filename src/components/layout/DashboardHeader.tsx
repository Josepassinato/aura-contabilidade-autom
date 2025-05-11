
import React from 'react';
import { Mic } from "lucide-react";
import ClientSelector from './ClientSelector';

interface DashboardHeaderProps {
  isVoiceActive: boolean;
  toggleVoiceAssistant: () => void;
}

export function DashboardHeader({ isVoiceActive, toggleVoiceAssistant }: DashboardHeaderProps) {
  return (
    <header className="h-16 px-6 border-b flex items-center justify-between bg-background">
      <div className="flex items-center">
        <ClientSelector />
      </div>
      <div className="flex items-center space-x-4">
        {isVoiceActive && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full animate-pulse-slow">
            <Mic className="h-5 w-5" />
            <span>Assistente de voz ativo</span>
          </div>
        )}
        <button 
          onClick={toggleVoiceAssistant}
          className={`p-2 rounded-full ${isVoiceActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
