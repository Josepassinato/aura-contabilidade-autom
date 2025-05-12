
import React, { useState, useEffect } from "react";
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
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";

const formSchema = z.object({
  searchTerm: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const GerenciarClientes = () => {
  const [activeTab, setActiveTab] = useState("listar");
  const [refreshKey, setRefreshKey] = useState(0); // Para forçar a atualização do componente ClientList

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const onSubmitSearch = (data: FormValues) => {
    console.log("Pesquisando:", data.searchTerm);
    // Implementar lógica de pesquisa
  };
  
  // Função para lidar com cliente adicionado com sucesso
  const handleClientAdded = () => {
    // Incrementa a chave para forçar a atualização do componente ClientList
    setRefreshKey(prev => prev + 1);
    // Muda para a aba de listar
    setActiveTab("listar");
    
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi adicionado com sucesso e a lista foi atualizada.",
    });
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

              {/* Usar a key para forçar remontagem quando refreshKey mudar */}
              <ClientList key={`client-list-${refreshKey}`} />
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
                onSuccess={handleClientAdded}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default GerenciarClientes;
