
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function FormActions() {
  return (
    <div className="flex gap-4">
      <Button type="submit">Salvar Configurações</Button>
      <Button 
        type="button" 
        variant="outline"
        onClick={() => {
          toast({
            title: "Testando conexão",
            description: "Tentando conectar ao banco de dados...",
          });
          
          // Simulate connection test
          setTimeout(() => {
            toast({
              title: "Conexão bem sucedida",
              description: "A conexão com o banco de dados foi estabelecida com sucesso!",
            });
          }, 2000);
        }}
      >
        Testar Conexão
      </Button>
    </div>
  );
}
