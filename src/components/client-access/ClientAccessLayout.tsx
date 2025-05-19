
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";

interface ClientAccessLayoutProps {
  children: React.ReactNode;
}

export const ClientAccessLayout = ({ children }: ClientAccessLayoutProps) => {
  const { enhancedLogout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    enhancedLogout();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <BackButton />
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-2">Portal de acesso ao cliente</p>
        </div>
        
        {children}
      </div>
    </div>
  );
};
