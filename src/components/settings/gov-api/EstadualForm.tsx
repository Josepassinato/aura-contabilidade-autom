
import React from "react";
import { useForm } from "react-hook-form";
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
import { estadualFormSchema, EstadualFormValues } from "./FormSchemas";

export function EstadualForm() {
  // Get stored values from localStorage if they exist
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
        sc: {
          apiKey: localStorage.getItem("gov-estadual-sc-key") || "",
          username: localStorage.getItem("gov-estadual-sc-username") || "",
          password: localStorage.getItem("gov-estadual-sc-password") || "",
          certificate: localStorage.getItem("gov-estadual-sc-cert") || "",
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
        sc: {
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

  const form = useForm<EstadualFormValues>({
    resolver: zodResolver(estadualFormSchema),
    defaultValues: storedEstadualValues,
  });

  function onSubmit(data: EstadualFormValues) {
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
    
    // Store SC values
    localStorage.setItem("gov-estadual-sc-key", data.sc.apiKey || "");
    localStorage.setItem("gov-estadual-sc-username", data.sc.username || "");
    localStorage.setItem("gov-estadual-sc-password", data.sc.password || "");
    localStorage.setItem("gov-estadual-sc-cert", data.sc.certificate || "");
    
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <SEFAZFormSection 
          state="sp" 
          title="SEFAZ São Paulo" 
          control={form.control} 
        />
        
        <SEFAZFormSection 
          state="rj" 
          title="SEFAZ Rio de Janeiro" 
          control={form.control} 
        />
        
        <SEFAZFormSection 
          state="sc" 
          title="SEFAZ Santa Catarina" 
          control={form.control} 
        />
        
        <SEFAZFormSection 
          state="mg" 
          title="SEFAZ Minas Gerais" 
          control={form.control} 
        />

        <Button type="submit">Salvar Configurações Estaduais</Button>
      </form>
    </Form>
  );
}

type SEFAZFormSectionProps = {
  state: "sp" | "rj" | "sc" | "mg";
  title: string;
  control: any;
}

function SEFAZFormSection({ state, title, control }: SEFAZFormSectionProps) {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h3 className="text-md font-medium">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${state}.username`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário SEFAZ-{state.toUpperCase()}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`${state}.password`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha SEFAZ-{state.toUpperCase()}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name={`${state}.apiKey`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Key SEFAZ-{state.toUpperCase()}</FormLabel>
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
        control={control}
        name={`${state}.certificate`}
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
  );
}
