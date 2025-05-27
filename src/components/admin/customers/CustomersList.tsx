
import React, { useState } from "react";
import { CustomerSummary } from "@/services/supabase/customerManagementService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, MessageSquare, Building2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomerSubscriptionForm } from "./CustomerSubscriptionForm";

interface CustomersListProps {
  customers: CustomerSummary[];
  isLoading: boolean;
  onCustomerUpdate: () => void;
  onSendMessage: (customerIds: string[]) => void;
}

export function CustomersList({ 
  customers, 
  isLoading,
  onCustomerUpdate,
  onSendMessage
}: CustomersListProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<CustomerSummary | null>(null);
  
  const handleCheckboxChange = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    }
  };
  
  const handleEditSubscription = (customer: CustomerSummary) => {
    setEditingCustomer(customer);
  };
  
  const handleCloseDialog = () => {
    setEditingCustomer(null);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inativo</Badge>;
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      default:
        return <Badge variant="outline">Indeterminado</Badge>;
    }
  };
  
  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500">Ativa</Badge>;
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasada</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="text-red-500">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Nenhuma</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-muted-foreground">Carregando escritórios de contabilidade...</p>
      </div>
    );
  }
  
  if (customers.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum escritório de contabilidade encontrado</h3>
        <p className="text-muted-foreground">
          Não há escritórios de contabilidade cadastrados no sistema ainda
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {selectedCustomers.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSendMessage(selectedCustomers)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Enviar mensagem para {selectedCustomers.length} escritório(s)
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedCustomers(customers.map(c => c.id));
                    } else {
                      setSelectedCustomers([]);
                    }
                  }}
                  checked={selectedCustomers.length === customers.length && customers.length > 0}
                  className="h-4 w-4"
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Escritório de Contabilidade
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clientes
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="text-right">Mensalidade</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <input 
                    type="checkbox" 
                    onChange={(e) => handleCheckboxChange(customer.id, e.target.checked)}
                    checked={selectedCustomers.includes(customer.id)}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      {customer.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{customer.clientsCount || 0}</span>
                    <span className="text-xs text-muted-foreground">clientes</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(customer.status)}</TableCell>
                <TableCell>{getSubscriptionBadge(customer.subscriptionStatus)}</TableCell>
                <TableCell>{customer.subscriptionPlan === 'none' ? '—' : customer.subscriptionPlan}</TableCell>
                <TableCell className="text-right">
                  {customer.monthlyFee > 0 
                    ? `R$ ${customer.monthlyFee.toFixed(2)}` 
                    : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditSubscription(customer)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar assinatura
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendMessage([customer.id])}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar mensagem
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        {editingCustomer && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gerenciar Assinatura - {editingCustomer.name}</DialogTitle>
            </DialogHeader>
            <CustomerSubscriptionForm 
              customer={editingCustomer}
              onSuccess={() => {
                handleCloseDialog();
                onCustomerUpdate();
              }}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
