import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Users, FileText, Calendar, RefreshCw } from 'lucide-react';
import { initializeDemoData, clearDemoData, isDemoMode } from '@/data/demoData';
import { useToast } from '@/hooks/use-toast';

interface DemoDataManagerProps {
  onDataLoaded?: () => void;
  showCard?: boolean;
}

export function DemoDataManager({ onDataLoaded, showCard = true }: DemoDataManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  const demoActive = isDemoMode();

  const handleLoadDemo = async () => {
    setIsLoading(true);
    
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      initializeDemoData();
      
      toast({
        title: "Dados demo carregados!",
        description: "O sistema agora está populado com dados de demonstração.",
      });
      
      if (onDataLoaded) {
        onDataLoaded();
      }
      
      // Forçar reload para mostrar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Erro ao carregar dados demo",
        description: "Ocorreu um problema. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDemo = async () => {
    setIsClearing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      clearDemoData();
      
      toast({
        title: "Dados demo removidos",
        description: "O sistema foi limpo e está pronto para dados reais.",
      });
      
      if (onDataLoaded) {
        onDataLoaded();
      }
      
      // Forçar reload para mostrar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Erro ao limpar dados demo",
        description: "Ocorreu um problema. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (!showCard) {
    return (
      <div className="flex gap-2">
        {!demoActive ? (
          <Button 
            onClick={handleLoadDemo}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Carregar Demo
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleClearDemo}
            disabled={isClearing}
            variant="outline"
            size="sm"
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Demo
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Dados de Demonstração
        </CardTitle>
        <CardDescription>
          {demoActive 
            ? "Modo demo ativo. Dados de demonstração carregados." 
            : "Carregue dados de exemplo para explorar todas as funcionalidades."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoActive && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              O sistema está em modo demo com dados fictícios para demonstração.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>3 Clientes exemplo</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>12 Documentos ficticios</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>5 Obrigações fiscais</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!demoActive ? (
            <Button 
              onClick={handleLoadDemo}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Carregando dados demo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Carregar Dados Demo
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleClearDemo}
              disabled={isClearing}
              variant="outline"
              className="flex-1"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Limpando dados...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Dados Demo
                </>
              )}
            </Button>
          )}
        </div>

        {!demoActive && (
          <p className="text-xs text-muted-foreground">
            Os dados demo incluem clientes, documentos, transações e obrigações fiscais 
            para que você possa explorar todas as funcionalidades do sistema.
          </p>
        )}
      </CardContent>
    </Card>
  );
}