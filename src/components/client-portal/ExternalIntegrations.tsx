
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Link2, Database, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { blingService } from "@/services/integracoes/blingService";

interface ExternalIntegrationsProps {
  clientId: string;
}

export const ExternalIntegrations = ({ clientId }: ExternalIntegrationsProps) => {
  const [open, setOpen] = useState(false);
  const [integrationType, setIntegrationType] = useState<string>("bling");
  const [isConnecting, setIsConnecting] = useState(false);

  const form = useForm({
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      clientId: "",
      clientSecret: ""
    }
  });

  const handleConnect = async (values: any) => {
    setIsConnecting(true);
    
    try {
      if (integrationType === "bling") {
        // Usar o serviço específico do Bling
        const credentials = {
          clientId: values.clientId,
          clientSecret: values.clientSecret
        };
        
        // Testar conexão primeiro
        const isConnected = await blingService.testConnection(credentials);
        
        if (isConnected) {
          // Salvar credenciais
          await blingService.saveCredentials(clientId, credentials);
          
          toast({
            title: "Integração com Bling configurada",
            description: "Conexão estabelecida com sucesso! Agora você pode sincronizar seus dados.",
          });
        } else {
          throw new Error("Falha na conexão com Bling");
        }
      } else {
        // Para outros sistemas, manter simulação
        console.log(`Connecting to ${integrationType} with credentials:`, values);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Integração iniciada",
          description: `A solicitação de integração com ${getIntegrationName(integrationType)} foi enviada com sucesso.`,
        });
      }
      
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error connecting integration:", error);
      toast({
        title: "Erro na integração",
        description: "Não foi possível estabelecer a conexão. Verifique as credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const getIntegrationName = (type: string) => {
    switch (type) {
      case "bling": return "Bling";
      case "quickbooks": return "QuickBooks";
      case "xero": return "Xero";
      case "sage": return "Sage";
      case "erp": return "ERP";
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Integrações Externas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          Conecte seus sistemas de gestão para sincronização automática de dados contábeis.
        </p>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Conectar Sistema Externo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Conectar Sistema</DialogTitle>
              <DialogDescription>
                Insira os dados necessários para conectar seu sistema ao portal contábil.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleConnect)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <FormLabel>Tipo de Sistema</FormLabel>
                  <Select 
                    value={integrationType} 
                    onValueChange={setIntegrationType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bling">Bling</SelectItem>
                      <SelectItem value="quickbooks">QuickBooks</SelectItem>
                      <SelectItem value="xero">Xero</SelectItem>
                      <SelectItem value="sage">Sage</SelectItem>
                      <SelectItem value="erp">ERP Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
{integrationType === "bling" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu Client ID do Bling" {...field} />
                          </FormControl>
                          <FormDescription>
                            Encontre no painel de API do Bling em Configurações &gt; API.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Seu Client Secret do Bling" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Mantenha este segredo protegido e nunca o compartilhe.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chave API</FormLabel>
                          <FormControl>
                            <Input placeholder="Insira sua chave API" {...field} />
                          </FormControl>
                          <FormDescription>
                            Encontre esta informação no painel de desenvolvedor do seu sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Segredo API</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Insira o segredo API" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Nunca compartilhe este segredo com terceiros.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Conexão segura
                  </div>
                  <Button type="submit" disabled={isConnecting}>
                    {isConnecting ? "Conectando..." : "Conectar Sistema"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
