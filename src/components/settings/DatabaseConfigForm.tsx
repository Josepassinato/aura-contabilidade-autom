
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
  dbType: z.string().min(1, { message: "Selecione um tipo de banco de dados" }),
  host: z.string().min(1, { message: "O host é obrigatório" }),
  port: z.coerce.number().min(1).max(65535),
  database: z.string().min(1, { message: "O nome do banco de dados é obrigatório" }),
  username: z.string().min(1, { message: "O usuário é obrigatório" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
  ssl: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function DatabaseConfigForm() {
  // Get stored values from localStorage if they exist
  const storedValues = typeof window !== "undefined" 
    ? {
        dbType: localStorage.getItem("db-type") || "postgres",
        host: localStorage.getItem("db-host") || "localhost",
        port: parseInt(localStorage.getItem("db-port") || "5432"),
        database: localStorage.getItem("db-name") || "contabil",
        username: localStorage.getItem("db-username") || "",
        password: localStorage.getItem("db-password") || "",
        ssl: localStorage.getItem("db-ssl") === "true",
      }
    : {
        dbType: "postgres",
        host: "localhost",
        port: 5432,
        database: "contabil",
        username: "",
        password: "",
        ssl: true,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: storedValues,
  });

  function onSubmit(data: FormValues) {
    // Store values in localStorage
    localStorage.setItem("db-type", data.dbType);
    localStorage.setItem("db-host", data.host);
    localStorage.setItem("db-port", data.port.toString());
    localStorage.setItem("db-name", data.database);
    localStorage.setItem("db-username", data.username);
    localStorage.setItem("db-password", data.password);
    localStorage.setItem("db-ssl", data.ssl.toString());

    toast({
      title: "Configuração salva",
      description: "As configurações do banco de dados foram atualizadas com sucesso.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração de Banco de Dados</h2>
        <p className="text-sm text-muted-foreground">
          Configure os parâmetros de conexão com o banco de dados utilizado pelo sistema contábil.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="dbType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Banco de Dados</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo de banco de dados" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="mssql">SQL Server</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porta</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="database"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Banco de Dados</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="ssl"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Usar SSL</FormLabel>
                  <FormDescription>
                    Habilite para usar conexão segura com o banco de dados.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

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
        </form>
      </Form>
    </div>
  );
}
