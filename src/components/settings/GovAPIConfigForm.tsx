
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UF } from "@/services/governamental/estadualIntegration";

const federalFormSchema = z.object({
  receita: z.object({
    apiKey: z.string().min(1, { message: "A chave API é obrigatória" }),
    certificate: z.string().optional(),
  }),
  cnd: z.object({
    username: z.string().min(1, { message: "O usuário é obrigatório" }),
    password: z.string().min(1, { message: "A senha é obrigatória" }),
  }),
  cnpj: z.object({
    apiKey: z.string().min(1, { message: "A chave API é obrigatória" }),
  }),
});

const estadualFormSchema = z.object({
  sp: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
  rj: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
  mg: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
});

type FederalFormValues = z.infer<typeof federalFormSchema>;
type EstadualFormValues = z.infer<typeof estadualFormSchema>;

export function GovAPIConfigForm() {
  const [activeTab, setActiveTab] = useState("federal");

  // Get stored values from localStorage if they exist
  const storedFederalValues = typeof window !== "undefined" 
    ? {
        receita: {
          apiKey: localStorage.getItem("gov-receita-key") || "",
          certificate: localStorage.getItem("gov-receita-cert") || "",
        },
        cnd: {
          username: localStorage.getItem("gov-cnd-username") || "",
          password: localStorage.getItem("gov-cnd-password") || "",
        },
        cnpj: {
          apiKey: localStorage.getItem("gov-cnpj-key") || "",
        },
      }
    : {
        receita: {
          apiKey: "",
          certificate: "",
        },
        cnd: {
          username: "",
          password: "",
        },
        cnpj: {
          apiKey: "",
        },
      };

  const storedEstadualValues = typeof window !== "undefined"
    ? {
        sp: {
          apiKey: localStorage.getItem("gov-estadual-sp-key") || "",
          username: localStorage.getItem("gov-estadual-sp-username") || "",
          password: localStorage.getItem("gov-estadual-sp-password") || "",
          certificate: localStorage.getItem("gov-estadual-sp-cert") || "",
        },
        rj: {
          apiKey: localStorage.getItem("gov-estadual-rj-key") || "",
          username: localStorage.getItem("gov-estadual-rj-username") || "",
          password: localStorage.getItem("gov-estadual-rj-password") || "",
          certificate: localStorage.getItem("gov-estadual-rj-cert") || "",
        },
        mg: {
          apiKey: localStorage.getItem("gov-estadual-mg-key") || "",
          username: localStorage.getItem("gov-estadual-mg-username") || "",
          password: localStorage.getItem("gov-estadual-mg-password") || "",
          certificate: localStorage.getItem("gov-estadual-mg-cert") || "",
        },
      }
    : {
        sp: {
          apiKey: "",
          username: "",
          password: "",
          certificate: "",
        },
        rj: {
          apiKey: "",
          username: "",
          password: "",
          certificate: "",
        },
        mg: {
          apiKey: "",
          username: "",
          password: "",
          certificate: "",
        },
      };

  const federalForm = useForm<FederalFormValues>({
    resolver: zodResolver(federalFormSchema),
    defaultValues: storedFederalValues,
  });

  const estadualForm = useForm<EstadualFormValues>({
    resolver: zodResolver(estadualFormSchema),
    defaultValues: storedEstadualValues,
  });

  function onFederalSubmit(data: FederalFormValues) {
    // Store values in localStorage
    localStorage.setItem("gov-receita-key", data.receita.apiKey);
    localStorage.setItem("gov-receita-cert", data.receita.certificate || "");
    localStorage.setItem("gov-cnd-username", data.cnd.username);
    localStorage.setItem("gov-cnd-password", data.cnd.password);
    localStorage.setItem("gov-cnpj-key", data.cnpj.apiKey);

    toast({
      title: "Configuração salva",
      description: "As configurações das APIs governamentais federais foram atualizadas com sucesso.",
    });
  }

  function onEstadualSubmit(data: EstadualFormValues) {
    // Store SP values
    localStorage.setItem("gov-estadual-sp-key", data.sp.apiKey || "");
    localStorage.setItem("gov-estadual-sp-username", data.sp.username || "");
    localStorage.setItem("gov-estadual-sp-password", data.sp.password || "");
    localStorage.setItem("gov-estadual-sp-cert", data.sp.certificate || "");
    
    // Store RJ values
    localStorage.setItem("gov-estadual-rj-key", data.rj.apiKey || "");
    localStorage.setItem("gov-estadual-rj-username", data.rj.username || "");
    localStorage.setItem("gov-estadual-rj-password", data.rj.password || "");
    localStorage.setItem("gov-estadual-rj-cert", data.rj.certificate || "");
    
    // Store MG values
    localStorage.setItem("gov-estadual-mg-key", data.mg.apiKey || "");
    localStorage.setItem("gov-estadual-mg-username", data.mg.username || "");
    localStorage.setItem("gov-estadual-mg-password", data.mg.password || "");
    localStorage.setItem("gov-estadual-mg-cert", data.mg.certificate || "");

    toast({
      title: "Configuração salva",
      description: "As configurações das APIs governamentais estaduais foram atualizadas com sucesso.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">APIs Governamentais</h2>
        <p className="text-sm text-muted-foreground">
          Configure as credenciais para acesso às APIs de serviços governamentais utilizados pelo sistema.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="federal">Federal</TabsTrigger>
          <TabsTrigger value="estadual">Estadual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="federal">
          <Form {...federalForm}>
            <form onSubmit={federalForm.handleSubmit(onFederalSubmit)} className="space-y-8">
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-md font-medium">Receita Federal</h3>
                
                <FormField
                  control={federalForm.control}
                  name="receita.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave de API da Receita Federal</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Chave para acesso aos serviços da Receita Federal.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={federalForm.control}
                  name="receita.certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado Digital (Base64)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Cole aqui o conteúdo do certificado em formato Base64" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Opcional: Certificado digital para autenticação em serviços específicos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-md font-medium">CND - Certidão Negativa de Débitos</h3>
                
                <FormField
                  control={federalForm.control}
                  name="cnd.username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Usuário para acesso ao serviço de CND.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={federalForm.control}
                  name="cnd.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Senha para acesso ao serviço de CND.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-md font-medium">API de Consulta CNPJ</h3>
                
                <FormField
                  control={federalForm.control}
                  name="cnpj.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave de API</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Chave para acesso ao serviço de consulta de CNPJ.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Salvar Configurações Federais</Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="estadual">
          <Form {...estadualForm}>
            <form onSubmit={estadualForm.handleSubmit(onEstadualSubmit)} className="space-y-8">
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-md font-medium">SEFAZ São Paulo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={estadualForm.control}
                    name="sp.username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário SEFAZ-SP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={estadualForm.control}
                    name="sp.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha SEFAZ-SP</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={estadualForm.control}
                  name="sp.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key SEFAZ-SP</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Para integração com o ambiente de homologação ou produção.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={estadualForm.control}
                  name="sp.certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado Digital (Base64)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Cole aqui o conteúdo do certificado em formato Base64" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-md font-medium">SEFAZ Rio de Janeiro</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={estadualForm.control}
                    name="rj.username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário SEFAZ-RJ</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={estadualForm.control}
                    name="rj.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha SEFAZ-RJ</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={estadualForm.control}
                  name="rj.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key SEFAZ-RJ</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Para integração com o ambiente de homologação ou produção.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={estadualForm.control}
                  name="rj.certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado Digital (Base64)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Cole aqui o conteúdo do certificado em formato Base64" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-md font-medium">SEFAZ Minas Gerais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={estadualForm.control}
                    name="mg.username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário SEFAZ-MG</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={estadualForm.control}
                    name="mg.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha SEFAZ-MG</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={estadualForm.control}
                  name="mg.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key SEFAZ-MG</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Para integração com o ambiente de homologação ou produção.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={estadualForm.control}
                  name="mg.certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado Digital (Base64)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Cole aqui o conteúdo do certificado em formato Base64" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Salvar Configurações Estaduais</Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
