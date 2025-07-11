
import React from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceAssistantButton } from "./VoiceAssistantButton";
import { ClientSelector } from "./ClientSelector";
import { AccountingStatus } from "./AccountingStatus";
import { useAuth } from "@/contexts/auth";

interface DashboardHeaderProps {
  isVoiceActive?: boolean;
  toggleVoiceAssistant?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isVoiceActive,
  toggleVoiceAssistant,
}) => {
  const { isAuthenticated, navigateToLogin } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b glass px-4">
      <div className="flex md:hidden">
        <Button variant="ghost" size="icon" className="md:hidden transition-smooth hover:bg-primary/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      
      <div className="flex-1">
        {isAuthenticated ? (
          <ClientSelector />
        ) : (
          <div className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            ContaFlix
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <AccountingStatus />
            
            <Button variant="ghost" size="icon" className="relative transition-smooth hover:bg-primary/10 hover:shadow-glow">
              <Bell className="h-5 w-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              <span className="sr-only">Notifications</span>
            </Button>
            
            {toggleVoiceAssistant && (
              <VoiceAssistantButton 
                isActive={isVoiceActive || false} 
                onClick={toggleVoiceAssistant} 
              />
            )}
          </>
        ) : (
          <Button onClick={() => navigateToLogin()} className="bg-gradient-primary hover:shadow-glow transition-smooth">
            Fazer Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
