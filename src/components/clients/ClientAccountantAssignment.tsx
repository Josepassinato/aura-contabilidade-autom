import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

interface Accountant {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface Client {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  accountant_id: string | null;
  status: string;
}

interface ClientAccountantAssignmentProps {
  onAssignmentChange?: () => void;
}

export const ClientAccountantAssignment: React.FC<ClientAccountantAssignmentProps> = ({
  onAssignmentChange
}) => {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [unassignedClients, setUnassignedClients] = useState<Client[]>([]);
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar contadores
      const { data: accountantsData, error: accountantsError } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, email')
        .eq('role', 'accountant');

      if (accountantsError) throw accountantsError;

      // Buscar todos os clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('accounting_clients')
        .select('id, name, cnpj, email, accountant_id, status');

      if (clientsError) throw clientsError;

      setAccountants(accountantsData || []);
      
      const unassigned = (clientsData || []).filter(client => !client.accountant_id);
      const assigned = (clientsData || []).filter(client => client.accountant_id);
      
      setUnassignedClients(unassigned);
      setAssignedClients(assigned);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const assignClientToAccountant = async (clientId: string, accountantUserId: string) => {
    try {
      const { error } = await supabase
        .from('accounting_clients')
        .update({ accountant_id: accountantUserId })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cliente associado ao contador com sucesso',
      });

      await fetchData();
      onAssignmentChange?.();
    } catch (error) {
      console.error('Erro ao associar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível associar o cliente',
        variant: 'destructive'
      });
    }
  };

  const unassignClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('accounting_clients')
        .update({ accountant_id: null })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cliente desassociado do contador',
      });

      await fetchData();
      onAssignmentChange?.();
    } catch (error) {
      console.error('Erro ao desassociar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desassociar o cliente',
        variant: 'destructive'
      });
    }
  };

  const getAccountantName = (accountantUserId: string) => {
    const accountant = accountants.find(acc => acc.user_id === accountantUserId);
    return accountant?.full_name || 'Contador não encontrado';
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar associações de clientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clientes não associados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Clientes Não Associados
          </CardTitle>
          <CardDescription>
            {unassignedClients.length} clientes aguardando associação com um contador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unassignedClients.length === 0 ? (
            <p className="text-muted-foreground">Todos os clientes estão associados a contadores.</p>
          ) : (
            <div className="space-y-4">
              {unassignedClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-muted-foreground">{client.cnpj} • {client.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => assignClientToAccountant(client.id, value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecionar contador" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountants.map((accountant) => (
                          <SelectItem key={accountant.user_id} value={accountant.user_id}>
                            {accountant.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clientes associados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Clientes Associados
          </CardTitle>
          <CardDescription>
            {assignedClients.length} clientes já associados a contadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedClients.length === 0 ? (
            <p className="text-muted-foreground">Nenhum cliente foi associado ainda.</p>
          ) : (
            <div className="space-y-4">
              {assignedClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-muted-foreground">{client.cnpj} • {client.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {getAccountantName(client.accountant_id!)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={client.accountant_id!} 
                      onValueChange={(value) => assignClientToAccountant(client.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accountants.map((accountant) => (
                          <SelectItem key={accountant.user_id} value={accountant.user_id}>
                            {accountant.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unassignClient(client.id)}
                    >
                      Desassociar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};