import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { DataPagination } from '@/components/ui/data-pagination';
import { useDebounce } from '@/hooks/useDebounce';

export function InvitationsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'accepted' | 'expired'>('all');
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    invitations,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    refresh
  } = useInvitations({
    status,
    searchTerm: debouncedSearchTerm,
    pageSize: 10
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      accepted: 'default',
      expired: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'pending' ? 'Pendente' : 
         status === 'accepted' ? 'Aceito' : 
         status === 'expired' ? 'Expirado' : status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Convites de Usuário</CardTitle>
            <CardDescription>
              Gerencie convites enviados para novos usuários do sistema
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Convite
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou nome do convidante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="accepted">Aceitos</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tabela */}
        {error && (
          <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Convidado por
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Criado em
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Expira em
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Carregando...
                      </div>
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                      {searchTerm || status !== 'all' 
                        ? 'Nenhum convite encontrado com os filtros aplicados'
                        : 'Nenhum convite encontrado'
                      }
                    </td>
                  </tr>
                ) : (
                  invitations.map((invitation) => (
                    <tr key={invitation.id} className="border-b">
                      <td className="h-12 px-4 align-middle">
                        <div className="font-medium">{invitation.email}</div>
                      </td>
                      <td className="h-12 px-4 align-middle">
                        <Badge variant="outline">
                          {invitation.role === 'admin' ? 'Admin' :
                           invitation.role === 'accountant' ? 'Contador' :
                           invitation.role === 'client' ? 'Cliente' : invitation.role}
                        </Badge>
                      </td>
                      <td className="h-12 px-4 align-middle">
                        {invitation.invited_by_name || 'N/A'}
                      </td>
                      <td className="h-12 px-4 align-middle">
                        {getStatusBadge(invitation.status)}
                      </td>
                      <td className="h-12 px-4 align-middle text-sm text-muted-foreground">
                        {formatDate(invitation.created_at)}
                      </td>
                      <td className="h-12 px-4 align-middle text-sm text-muted-foreground">
                        {formatDate(invitation.expires_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginação */}
        {totalCount > 0 && (
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}