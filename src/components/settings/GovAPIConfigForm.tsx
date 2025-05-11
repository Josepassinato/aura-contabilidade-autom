
import React from "react";
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

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

export function GovAPIConfigForm() {
  // Get stored values from localStorage if they exist
  const storedValues = typeof window !== "undefined" 
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: storedValues,
  });

  function onSubmit(data: FormValues) {
    // Store values in localStorage
    localStorage.setItem("gov-receita-key", data.receita.apiKey);
    localStorage.setItem("gov-receita-cert", data.receita.certificate || "");
    localStorage.setItem("gov-cnd-username", data.cnd.username);
    localStorage.setItem("gov-cnd-password", data.cnd.password);
    localStorage.setItem("gov-cnpj-key", data.cnpj.apiKey);

    toast({
      title: "Configuração salva",
      description: "As configurações das APIs governamentais foram atualizadas com sucesso.",
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4 border rounded-md p-4">
            <h3 className="text-md font-medium">Receita Federal</h3>
            
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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

          <Button type="submit">Salvar Configurações</Button>
        </form>
      </Form>
    </div>
  );
}
