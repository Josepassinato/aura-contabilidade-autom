
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut } from "lucide-react";
import { APIConfigForm } from "@/components/settings/APIConfigForm";
import { DatabaseConfigForm } from "@/components/settings/DatabaseConfigForm";
import { GovAPIConfigForm } from "@/components/settings/GovAPIConfigForm";
import { SupabaseConfig } from "@/components/settings/SupabaseConfig";
import { BancoConfigForm } from "@/components/settings/BancoConfigForm";
import { LegislacaoApiConfigForm } from "@/components/settings/LegislacaoApiConfigForm";
import { useAuth } from "@/contexts/auth";
import { BackButton } from "@/components/navigation/BackButton";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("database");
  const { isAdmin, enhancedLogout } = useAuth();
  
  // Set default active tab based on user role
  useEffect(() => {
    setActiveTab(isAdmin ? "supabase" : "database");
  }, [isAdmin]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BackButton />
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={enhancedLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações das APIs e conexões utilizadas pelo sistema.
              {!isAdmin && " Algumas configurações estão disponíveis apenas para administradores."}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto mb-6">
            <TabsList className="flex min-w-max">
              {isAdmin && <TabsTrigger value="supabase">Supabase</TabsTrigger>}
              {isAdmin && <TabsTrigger value="openai">OpenAI API</TabsTrigger>}
              <TabsTrigger value="database">Banco de Dados</TabsTrigger>
              <TabsTrigger value="govapi">APIs Governamentais</TabsTrigger>
              <TabsTrigger value="bancos">Integração Bancária</TabsTrigger>
              <TabsTrigger value="legislacao">Legislação Contábil</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-4 border rounded-lg">
            {isAdmin && (
              <TabsContent value="supabase" className="space-y-4">
                <SupabaseConfig />
              </TabsContent>
            )}
            {isAdmin && (
              <TabsContent value="openai" className="space-y-4">
                <APIConfigForm />
              </TabsContent>
            )}
            <TabsContent value="database" className="space-y-4">
              <DatabaseConfigForm />
            </TabsContent>
            <TabsContent value="govapi" className="space-y-4">
              <GovAPIConfigForm />
            </TabsContent>
            <TabsContent value="bancos" className="space-y-4">
              <BancoConfigForm />
            </TabsContent>
            <TabsContent value="legislacao" className="space-y-4">
              <LegislacaoApiConfigForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
