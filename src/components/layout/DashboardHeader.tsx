
import React from 'react';
import { Mic } from "lucide-react";
import { ClientSelector } from './ClientSelector';
import { Link } from 'react-router-dom';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Button } from "@/components/ui/button";

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
        <NotificationCenter />
        <Button 
          onClick={toggleVoiceAssistant}
          variant="ghost"
          className={`p-2 rounded-full ${isVoiceActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'} voice-assistant-button`}
          size="icon"
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Link to="/configuracoes" className="settings-link">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-secondary"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default DashboardHeader;
