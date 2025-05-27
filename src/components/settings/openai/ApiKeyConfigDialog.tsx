
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeyConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApiKeyConfigDialog({ open, onOpenChange, onSuccess }: ApiKeyConfigDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave da API válida.",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      toast({
        title: "Formato inválido",
        description: "A chave da API OpenAI deve começar com 'sk-'.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store the API key securely in Supabase secrets
      const { error } = await supabase.functions.invoke('store-openai-key', {
        body: { apiKey: apiKey.trim() }
      });

      if (error) {
        throw error;
      }

      // Mark as configured locally
      localStorage.setItem("openai-configured", "true");
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('openai-config-updated'));

      toast({
        title: "Sucesso",
        description: "Chave da API OpenAI configurada com sucesso!",
      });

      setApiKey("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao configurar chave da API:", error);
      toast({
        title: "Erro",
        description: "Não foi possível configurar a chave da API. Verifique se a chave é válida.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setApiKey("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Configurar Chave da API OpenAI</DialogTitle>
            <DialogDescription>
              Insira sua chave da API OpenAI. Ela será armazenada de forma segura no Supabase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Chave da API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Sua chave da API OpenAI que começa com "sk-"
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Configurando..." : "Configurar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
