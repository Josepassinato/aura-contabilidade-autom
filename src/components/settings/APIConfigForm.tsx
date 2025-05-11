
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  apiKey: z.string().min(1, { message: "A chave API é obrigatória" }),
  model: z.string().min(1, { message: "Selecione um modelo" }),
  temperature: z.coerce.number().min(0).max(2).default(0.7),
  maxTokens: z.coerce.number().min(100).max(16000).default(4000),
});

type FormValues = z.infer<typeof formSchema>;

export function APIConfigForm() {
  // Get stored values from localStorage if they exist
  const storedValues = typeof window !== "undefined" 
    ? {
        apiKey: localStorage.getItem("openai-api-key") || "",
        model: localStorage.getItem("openai-model") || "gpt-4o-mini",
        temperature: parseFloat(localStorage.getItem("openai-temperature") || "0.7"),
        maxTokens: parseInt(localStorage.getItem("openai-max-tokens") || "4000"),
      }
    : {
        apiKey: "",
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 4000,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: storedValues,
  });

  function onSubmit(data: FormValues) {
    // Store values in localStorage
    localStorage.setItem("openai-api-key", data.apiKey);
    localStorage.setItem("openai-model", data.model);
    localStorage.setItem("openai-temperature", data.temperature.toString());
    localStorage.setItem("openai-max-tokens", data.maxTokens.toString());

    toast({
      title: "Configuração salva",
      description: "As configurações da API OpenAI foram atualizadas com sucesso.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração da API OpenAI</h2>
        <p className="text-sm text-muted-foreground">
          Configure os parâmetros de conexão com a API da OpenAI para utilização do assistente de voz
          e análise de dados contábeis.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chave API da OpenAI</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="sk-..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Insira sua chave API da OpenAI. Você pode obter uma em{" "}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    platform.openai.com
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4.5-preview">GPT-4.5 Preview</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecione o modelo de linguagem a ser utilizado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperatura</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="2"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Controla a aleatoriedade (0-2).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Tokens</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="100"
                      max="16000"
                      step="100"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Limite máximo de tokens para resposta.
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
