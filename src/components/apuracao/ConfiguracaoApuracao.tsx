
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function ConfiguracaoApuracao() {
  const salvarConfiguracoes = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Configurações salvas",
      description: "Suas configurações de apuração foram atualizadas com sucesso."
    });
  };

  return (
    <form onSubmit={salvarConfiguracoes}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Processamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Fontes de Dados</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notas-fiscais">Importação Automática de NFe</Label>
                  <p className="text-sm text-muted-foreground">
                    Importar notas fiscais eletrônicas automaticamente da Receita Federal
                  </p>
                </div>
                <Switch id="notas-fiscais" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="extrato-bancario">Importação de Extrato Bancário</Label>
                  <p className="text-sm text-muted-foreground">
                    Conectar com APIs bancárias para importação de extratos
                  </p>
                </div>
                <Switch id="extrato-bancario" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="importacao-manual">Permitir Importação Manual</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que o cliente importe documentos manualmente
                  </p>
                </div>
                <Switch id="importacao-manual" defaultChecked />
              </div>
              
              <Separator />
              
              <h3 className="font-medium">Frequência de Processamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Execução Automática</Label>
                  <select className="w-full p-2 border rounded">
                    <option value="diario">Diariamente</option>
                    <option value="semanal" selected>Semanalmente</option>
                    <option value="mensal">Mensalmente</option>
                    <option value="manual">Apenas Manual</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Dia da Semana (se semanal)</Label>
                  <select className="w-full p-2 border rounded">
                    <option value="1">Segunda-feira</option>
                    <option value="2">Terça-feira</option>
                    <option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option>
                    <option value="5">Sexta-feira</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                  </select>
                </div>
              </div>
              
              <Separator />
              
              <h3 className="font-medium">Notificações</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacao-email">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar resultados da apuração por email
                  </p>
                </div>
                <Switch id="notificacao-email" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificacao-sistema">Notificações no Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar notificações no painel do contador
                  </p>
                </div>
                <Switch id="notificacao-sistema" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações e Conexões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Receita Federal</h3>
                <p className="text-sm text-muted-foreground">
                  Conexão com o sistema da Receita Federal
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Conectado
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sistema de Nota Fiscal Eletrônica</h3>
                <p className="text-sm text-muted-foreground">
                  Integração com NFe
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Conectado
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SPED</h3>
                <p className="text-sm text-muted-foreground">
                  Integração com Sistema Público de Escrituração Digital
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                Pendente
              </Badge>
            </div>
            
            <Button variant="outline" className="w-full">
              Gerenciar Integrações
            </Button>
          </CardContent>
        </Card>

        <Button type="submit">Salvar Configurações</Button>
      </div>
    </form>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {children}
    </span>
  );
}
