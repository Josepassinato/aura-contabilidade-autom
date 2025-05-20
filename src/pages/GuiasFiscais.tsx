
import React, { useState } from "react";
import { GuiasFiscaisGenerator } from "@/components/guias-fiscais/GuiasFiscaisGenerator";
import { GuiasFiscaisList } from "@/components/guias-fiscais/GuiasFiscaisList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileUp, LogOut } from "lucide-react";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { TaxGuide } from "@/types/taxGuides";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/navigation/BackButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";

// Mock data for tax guides with appropriate status
const mockGuias: TaxGuide[] = [
  {
    id: "1",
    clientId: "cliente1",
    clientName: "Empresa ABC Ltda",
    type: "DARF",
    reference: "IRPJ",
    dueDate: "2025-05-20",
    amount: 1250.75,
    status: "pendente",
    barCode: "85810000012-5 50760006190-1 09092022192-6 21010221655-9",
    generatedAt: "2025-05-01"
  },
  {
    id: "2",
    clientId: "cliente1",
    clientName: "Empresa ABC Ltda",
    type: "GPS",
    reference: "INSS",
    dueDate: "2025-05-15",
    amount: 876.30,
    status: "pendente",
    barCode: "85830000008-7 76300065201-5 09092022192-6 21010221655-9",
    generatedAt: "2025-05-01"
  },
  {
    id: "3",
    clientId: "cliente2",
    clientName: "Companhia XYZ S.A.",
    type: "DARF",
    reference: "CSLL",
    dueDate: "2025-05-20",
    amount: 3420.15,
    status: "pago",
    barCode: "85870000034-2 02000065203-8 09092022192-6 21010221655-9",
    generatedAt: "2025-04-25"
  }
];

const GuiasFiscais = () => {
  const [activeTab, setActiveTab] = useState("gerar");
  const [guias, setGuias] = useState<TaxGuide[]>(mockGuias);
  const { enhancedLogout } = useAuth();

  const handleGenerateGuia = (newGuia: TaxGuide) => {
    setGuias([...guias, { ...newGuia, id: `${guias.length + 1}`, generatedAt: new Date().toISOString().split('T')[0] }]);
    setActiveTab("lista");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
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
            <h1 className="text-2xl font-bold tracking-tight">Guias Fiscais</h1>
            <p className="text-muted-foreground">
              Geração e gestão de guias de pagamento de impostos
            </p>
          </div>
          <ClientSelector />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="gerar" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Gerar Guia
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Guias Geradas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerar">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Nova Guia Fiscal</CardTitle>
              </CardHeader>
              <CardContent>
                <GuiasFiscaisGenerator onGenerateGuia={handleGenerateGuia} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <CardTitle>Guias Fiscais Geradas</CardTitle>
              </CardHeader>
              <CardContent>
                <GuiasFiscaisList guias={guias} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GuiasFiscais;
