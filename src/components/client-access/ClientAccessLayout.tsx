
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { AIAssistant } from "@/components/chat/AIAssistant";

interface ClientAccessLayoutProps {
  children: React.ReactNode;
}

export const ClientAccessLayout = ({ children }: ClientAccessLayoutProps) => {
  const { enhancedLogout } = useAuth();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    enhancedLogout();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            title="Voltar à página anterior"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Voltar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            onClick={handleLogout}
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            Sair
          </Button>
        </div>
        
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">contaflows</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Portal de acesso ao cliente</p>
        </div>
        
        {children}
      </div>
      
      <AIAssistant />
    </div>
  );
};
