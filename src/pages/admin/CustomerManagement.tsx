
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AccessRestriction } from "@/components/settings/AccessRestriction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCcw, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomersList } from "@/components/admin/customers/CustomersList";
import { SupportTicketsList } from "@/components/admin/customers/SupportTicketsList";
import { BulkEmailForm } from "@/components/admin/customers/BulkEmailForm";
import { BackButton } from "@/components/navigation/BackButton";
import { 
  fetchCustomersWithSubscriptions,
  fetchSupportTickets,
  CustomerSummary,
  SupportTicket
} from "@/services/supabase/customerManagementService";

const CustomerManagement = () => {
  const { isAdmin, enhancedLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("customers");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      const [customersData, ticketsData] = await Promise.all([
        fetchCustomersWithSubscriptions(),
        fetchSupportTickets()
      ]);
      
      setCustomers(customersData);
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    loadData();
  };
  
  const handleSendMessage = (customerIds: string[]) => {
    setSelectedCustomerIds(customerIds);
    setBulkEmailOpen(true);
  };
  
  const handleEmailSent = () => {
    setBulkEmailOpen(false);
    setSelectedCustomerIds([]);
  };
  
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Show access restriction if user is not admin
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <AccessRestriction />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie assinaturas, tickets de suporte e comunicação com clientes
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="customers">Assinaturas</TabsTrigger>
            <TabsTrigger value="support">Suporte</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Clientes e Assinaturas</CardTitle>
                <CardDescription>
                  Visualize e gerencie as assinaturas e planos dos escritórios de contabilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center pb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Input
                      placeholder="Pesquisar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <CustomersList
                  customers={filteredCustomers}
                  isLoading={isLoading}
                  onCustomerUpdate={handleRefresh}
                  onSendMessage={handleSendMessage}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Tickets de Suporte</CardTitle>
                <CardDescription>
                  Gerencie os tickets de suporte abertos pelos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupportTicketsList 
                  tickets={tickets} 
                  isLoading={isLoading} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={bulkEmailOpen} onOpenChange={setBulkEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Email</DialogTitle>
          </DialogHeader>
          <BulkEmailForm
            selectedCustomerIds={selectedCustomerIds}
            customers={customers}
            onSuccess={handleEmailSent}
            onCancel={() => setBulkEmailOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CustomerManagement;
