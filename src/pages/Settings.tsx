
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APIConfigForm } from "@/components/settings/APIConfigForm";
import { DatabaseConfigForm } from "@/components/settings/DatabaseConfigForm";
import { GovAPIConfigForm } from "@/components/settings/GovAPIConfigForm";
import { SupabaseConfig } from "@/components/settings/SupabaseConfig";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações das APIs e conexões utilizadas pelo sistema.
          </p>
        </div>

        <Tabs defaultValue="supabase" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-4 mb-6">
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
            <TabsTrigger value="openai">OpenAI API</TabsTrigger>
            <TabsTrigger value="database">Banco de Dados</TabsTrigger>
            <TabsTrigger value="govapi">APIs Governamentais</TabsTrigger>
          </TabsList>
          <div className="p-4 border rounded-lg">
            <TabsContent value="supabase" className="space-y-4">
              <SupabaseConfig />
            </TabsContent>
            <TabsContent value="openai" className="space-y-4">
              <APIConfigForm />
            </TabsContent>
            <TabsContent value="database" className="space-y-4">
              <DatabaseConfigForm />
            </TabsContent>
            <TabsContent value="govapi" className="space-y-4">
              <GovAPIConfigForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
