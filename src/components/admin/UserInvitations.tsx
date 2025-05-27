
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Loader2, Mail, Copy, Trash2 } from 'lucide-react';
import { UserInvitation, CreateInvitationData, UpdateInvitationData } from '@/types/invitations';

const inviteFormSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'accountant', 'client'], {
    required_error: 'Selecione um papel',
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export const UserInvitations = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'accountant',
    },
  });

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data as UserInvitation[]) || []);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convites",
        variant: "destructive",
      });
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const onSubmit = async (data: InviteFormValues) => {
    if (!userProfile) return;

    setLoading(true);
    try {
      // Verificar se já existe um convite pendente para este email
      const { data: existingInvite } = await supabase
        .from('user_invitations' as any)
        .select('id')
        .eq('email', data.email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        toast({
          title: "Convite já existe",
          description: "Já existe um convite pendente para este email",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Gerar token único
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      // Criar convite
      const invitationData: CreateInvitationData = {
        email: data.email,
        role: data.role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: userProfile.id,
        invited_by_name: userProfile.full_name,
      };

      const { error } = await supabase
        .from('user_invitations' as any)
        .insert(invitationData);

      if (error) throw error;

      toast({
        title: "Convite enviado!",
        description: `Convite para ${data.email} foi criado com sucesso`,
      });

      form.reset();
      loadInvitations();
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o convite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite-signup?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link do convite foi copiado para a área de transferência",
    });
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Convite excluído",
        description: "O convite foi excluído com sucesso",
      });

      loadInvitations();
    } catch (error) {
      console.error('Erro ao excluir convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o convite",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'pending') {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'accepted':
        return <Badge variant="default">Aceito</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'accountant':
        return <Badge variant="default">Contador</Badge>;
      case 'client':
        return <Badge variant="secondary">Cliente</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Convidar Usuário</CardTitle>
          <CardDescription>
            Envie um convite para que um novo usuário se junte ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario@email.com"
                        type="email"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um papel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="accountant">Contador</SelectItem>
                        <SelectItem value="client">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convites Enviados</CardTitle>
          <CardDescription>
            Lista de todos os convites enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvitations ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Carregando convites...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum convite foi enviado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invitation.email}</span>
                      {getRoleBadge(invitation.role)}
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Enviado por {invitation.invited_by_name} em{' '}
                      {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expira em {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {invitation.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(invitation.token)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar Link
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteInvitation(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
