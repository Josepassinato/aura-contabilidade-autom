
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { openAiConfigSchema, OpenAiConfigFormValues } from "./schema";

type OpenAiConfigFormProps = {
  onSubmit: (data: OpenAiConfigFormValues) => Promise<void>;
  initialValues: OpenAiConfigFormValues;
  children?: React.ReactNode; // Add support for children prop
};

export function OpenAiConfigForm({ onSubmit, initialValues, children }: OpenAiConfigFormProps) {
  const form = useForm<OpenAiConfigFormValues>({
    resolver: zodResolver(openAiConfigSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chave API da OpenAI (Supabase Secret)</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="sk-..." 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Insira sua chave API da OpenAI. Será armazenada como segredo no Supabase. Obtenha uma em{" "}
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

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {children}
        </div>
      </form>
    </Form>
  );
}
