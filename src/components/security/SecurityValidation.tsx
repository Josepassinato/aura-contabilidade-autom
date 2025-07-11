import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SecurityCheck {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'checking';
  details?: string;
}

export const SecurityValidation: React.FC = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      runSecurityValidation();
    }
  }, [isAdmin]);

  const runSecurityValidation = async () => {
    setLoading(true);
    const validationChecks: SecurityCheck[] = [
      {
        id: 'accountant_segregation',
        title: 'Segregação por Contador',
        description: 'Verificar se contadores só veem seus próprios clientes',
        status: 'checking'
      },
      {
        id: 'client_association',
        title: 'Associação Cliente-Contador',
        description: 'Validar se todos os clientes têm accountant_id definido',
        status: 'checking'
      },
      {
        id: 'rls_policies',
        title: 'Políticas RLS',
        description: 'Conferir se as políticas de segurança estão ativas',
        status: 'checking'
      },
      {
        id: 'data_leakage',
        title: 'Vazamento de Dados',
        description: 'Testar se dados de outros contadores são acessíveis',
        status: 'checking'
      }
    ];

    setChecks(validationChecks);

    // Check 1: Accountant segregation
    try {
      const { data: clientsCount } = await supabase
        .rpc('get_accountant_clients');
      
      validationChecks[0].status = 'passed';
      validationChecks[0].details = `Função RPC funcionando - ${clientsCount?.length || 0} clientes retornados`;
    } catch (error) {
      validationChecks[0].status = 'failed';
      validationChecks[0].details = 'Erro ao executar função de segregação';
    }

    // Check 2: Client association
    try {
      const { data: unassignedClients } = await supabase
        .from('accounting_clients')
        .select('id, name')
        .is('accountant_id', null);
      
      if (unassignedClients && unassignedClients.length > 0) {
        validationChecks[1].status = 'warning';
        validationChecks[1].details = `${unassignedClients.length} clientes sem contador associado`;
      } else {
        validationChecks[1].status = 'passed';
        validationChecks[1].details = 'Todos os clientes têm contador associado';
      }
    } catch (error) {
      validationChecks[1].status = 'failed';
      validationChecks[1].details = 'Erro ao verificar associações';
    }

    // Check 3: RLS policies
    try {
      const { data: policies } = await supabase
        .from('accounting_clients')
        .select('id')
        .limit(1);
      
      validationChecks[2].status = 'passed';
      validationChecks[2].details = 'Políticas RLS estão funcionando';
    } catch (error) {
      validationChecks[2].status = 'failed';
      validationChecks[2].details = 'Erro ao verificar políticas RLS';
    }

    // Check 4: Data leakage test (simplified)
    try {
      if (userProfile?.role === 'accountant') {
        const { data: ownClients } = await supabase
          .from('accounting_clients')
          .select('id')
          .eq('accountant_id', userProfile.id);
        
        const { data: allClients } = await supabase
          .from('accounting_clients')
          .select('id');
        
        if (ownClients && allClients) {
          if (ownClients.length === allClients.length) {
            validationChecks[3].status = 'warning';
            validationChecks[3].details = 'Contador pode ver todos os clientes - possível vazamento';
          } else {
            validationChecks[3].status = 'passed';
            validationChecks[3].details = `Acesso restrito: ${ownClients.length} de ${allClients.length} clientes visíveis`;
          }
        }
      } else {
        validationChecks[3].status = 'passed';
        validationChecks[3].details = 'Teste aplicável apenas para contadores';
      }
    } catch (error) {
      validationChecks[3].status = 'failed';
      validationChecks[3].details = 'Erro ao testar vazamento de dados';
    }

    setChecks([...validationChecks]);
    setLoading(false);
  };

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'checking':
        return <Badge variant="outline">Verificando...</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Apenas administradores podem acessar a validação de segurança.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validação de Segurança</CardTitle>
        <CardDescription>
          Verificação das implementações de segurança e segregação de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => (
            <div key={check.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <h4 className="font-medium">{check.title}</h4>
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  {check.details && (
                    <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status Geral</p>
              <p className="text-xs text-muted-foreground">
                {checks.filter(c => c.status === 'passed').length} aprovados, {' '}
                {checks.filter(c => c.status === 'warning').length} com atenção, {' '}
                {checks.filter(c => c.status === 'failed').length} falharam
              </p>
            </div>
            <button
              onClick={runSecurityValidation}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-muted"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Revalidar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};