
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@/lib/supabase";

export const SupabaseConfig = () => {
  const [url, setUrl] = useState<string>(import.meta.env.VITE_SUPABASE_URL || "");
  const [key, setKey] = useState<string>(import.meta.env.VITE_SUPABASE_ANON_KEY || "");
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

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
      // Tenta fazer uma operação básica com o Supabase para testar a conexão
      const { data, error } = await supabase.from('client_documents').select('count()', { count: 'exact', head: true });
      
      if (error) throw error;
      
      toast({
        title: "Conexão estabelecida",
        description: "A conexão com o Supabase foi estabelecida com sucesso!",
      });
      
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast({
        title: "Falha na conexão",
        description: "Não foi possível conectar ao Supabase com as credenciais fornecidas.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const setupRequiredStructures = async () => {
    if (!supabase) {
      toast({
        title: "Erro de conexão",
        description: "É necessário estabelecer uma conexão com o Supabase primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    try {
      // 1. Verificar se o bucket existe e criar se necessário
      const { data: buckets, error: bucketsError } = await supabase.storage.getBucket('client-documents');
      
      if (bucketsError && bucketsError.message.includes('does not exist')) {
        // Criar o bucket
        const { error: createError } = await supabase.storage.createBucket('client-documents', {
          public: false,
        });
        
        if (createError) throw createError;
      } else if (bucketsError) {
        throw bucketsError;
      }

      // 2. Verificar se a tabela existe e criar se necessário
      const { error: tableCheckError } = await supabase
        .from('client_documents')
        .select('id')
        .limit(1);
      
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        // Criar a tabela (isso normalmente seria feito via Migration SQL)
        await supabase.rpc('create_client_documents_table');
      } else if (tableCheckError && !tableCheckError.message.includes('does not exist')) {
        throw tableCheckError;
      }
      
      toast({
        title: "Configuração concluída",
        description: "Bucket 'client-documents' e tabela 'client_documents' verificados/criados com sucesso!",
      });
      
    } catch (error) {
      console.error("Erro na configuração:", error);
      toast({
        title: "Falha na configuração",
        description: "Ocorreu um erro ao configurar as estruturas necessárias. Verifique o console para mais detalhes.",
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
          Configure as credenciais do Supabase para habilitar o armazenamento e gerenciamento de documentos
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
          <p>Necessário:</p>
          <ul className="list-disc list-inside">
            <li>Um bucket chamado 'client-documents'</li>
            <li>Uma tabela 'client_documents' com campos apropriados</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testConnection} disabled={isTesting}>
            {isTesting ? "Testando..." : "Testar Conexão"}
          </Button>
          <Button onClick={setupRequiredStructures} disabled={isTesting}>
            {isTesting ? "Configurando..." : "Configurar Estruturas"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConfig;
