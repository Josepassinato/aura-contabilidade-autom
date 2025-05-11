
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSupabaseClient } from "@/lib/supabase";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";

const formSchema = z.object({
  searchTerm: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const GerenciarClientes = () => {
  const [activeTab, setActiveTab] = useState("listar");
  const supabaseClient = useSupabaseClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const onSubmitSearch = (data: FormValues) => {
    console.log("Pesquisando:", data.searchTerm);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Clientes</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie seus clientes para automatizar a contabilidade
          </p>
        </div>
      </div>

      <Tabs defaultValue="listar" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="listar" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Listar Clientes
          </TabsTrigger>
          <TabsTrigger value="cadastrar" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listar" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Clientes Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitSearch)}
                  className="flex w-full max-w-sm items-center space-x-2 mb-4"
                >
                  <FormField
                    control={form.control}
                    name="searchTerm"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Pesquisar cliente..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </Form>

              <ClientList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cadastrar">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Novo Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientForm 
                onSuccess={() => {
                  toast({
                    title: "Cliente cadastrado",
                    description: "O cliente foi cadastrado com sucesso."
                  });
                  setActiveTab("listar");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default GerenciarClientes;
