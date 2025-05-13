
import React from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceAssistantButton } from "./VoiceAssistantButton";
import { ClientSelector } from "./ClientSelector";
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
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex md:hidden">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      
      <div className="flex-1">
        {isAuthenticated ? (
          <ClientSelector />
        ) : (
          <div className="text-lg font-semibold">ContaFlix</div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
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
          <Button onClick={() => navigateToLogin()}>
            Fazer Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
