
import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { BackButton } from "@/components/navigation/BackButton";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isClient } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: Tentativa de acesso à rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/analytics');
      } else if (isClient) {
        navigate('/client-portal');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6 py-8 rounded-lg border shadow-sm">
        <div className="text-left mb-4">
          <BackButton />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-medium mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={handleGoHome} 
            size="lg" 
            className="flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
