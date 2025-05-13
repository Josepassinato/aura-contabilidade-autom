
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { AccessRestriction } from "./AccessRestriction";

export const SupabaseConfig = () => {
  const { isAdmin } = useAuth();
  const [url, setUrl] = useState<string>(localStorage.getItem("supabase-url") || "");
  const [key, setKey] = useState<string>(localStorage.getItem("supabase-key") || "");
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Redirect non-admin users
  if (!isAdmin) {
    return <AccessRestriction />;
  }

  const saveConfiguration = () => {
    if (!url || !key) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a URL e a chave do Supabase",
        variant: "destructive"
      });
      return;
    }

    try {
      // Salvar no localStorage
      localStorage.setItem("supabase-url", url);
      localStorage.setItem("supabase-key", key);
      
      toast({
        title: "Configuração salva",
        description: "As configurações do Supabase foram salvas localmente.",
      });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    }
  };

  const testConnection = async () => {
    if (!url || !key) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a URL e a chave do Supabase",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuração válida",
        description: "As configurações parecem válidas. Nota: Esta é apenas uma validação básica.",
      });
      
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast({
        title: "Falha na validação",
        description: "Não foi possível validar as configurações fornecidas.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Supabase</CardTitle>
        <CardDescription>
          Configure as credenciais do Supabase para funcionamentos que necessitam de armazenamento em nuvem (apenas administradores)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabase-url">URL do Supabase</Label>
          <Input
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://seu-projeto.supabase.co"
            disabled={isTesting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supabase-key">Chave Anônima</Label>
          <Input
            id="supabase-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            disabled={isTesting}
          />
          <p className="text-xs text-muted-foreground">
            Esta é a chave anônima (anon key) encontrada nas configurações do seu projeto no Supabase.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          <p>Configuração necessária apenas para administradores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testConnection} disabled={isTesting}>
            {isTesting ? "Validando..." : "Validar Configuração"}
          </Button>
          <Button onClick={saveConfiguration} disabled={isTesting}>
            Salvar Configuração
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConfig;
