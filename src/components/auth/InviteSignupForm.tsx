
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { UserInvitation, UpdateInvitationData } from '@/types/invitations';

const inviteSignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a senha'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type InviteSignupFormValues = z.infer<typeof inviteSignupSchema>;

export const InviteSignupForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(true);
  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const form = useForm<InviteSignupFormValues>({
    resolver: zodResolver(inviteSignupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setInviteError('Token de convite não encontrado');
        setValidatingInvite(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_invitations' as any)
          .select('id, email, role, invited_by_name, expires_at')
          .eq('token', token)
          .eq('status', 'pending')
          .single();

        if (error || !data) {
          setInviteError('Convite inválido ou expirado');
          setValidatingInvite(false);
          return;
        }

        // Verificar se o convite não expirou
        if (new Date(data.expires_at) < new Date()) {
          setInviteError('Este convite expirou');
          setValidatingInvite(false);
          return;
        }

        setInvitation(data as UserInvitation);
        form.setValue('email', data.email);
        setValidatingInvite(false);
      } catch (error) {
        console.error('Erro ao validar convite:', error);
        setInviteError('Erro ao validar convite');
        setValidatingInvite(false);
      }
    };

    validateInvitation();
  }, [token, form]);

  const onSubmit = async (data: InviteSignupFormValues) => {
    if (!invitation) return;

    setLoading(true);
    try {
      // Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: invitation.role,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            role: invitation.role,
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Continuar mesmo se houver erro no perfil, pois pode ser criado pelo trigger
        }

        // Marcar convite como aceito
        const updateData: UpdateInvitationData = {
          status: 'accepted',
          accepted_at: new Date().toISOString()
        };

        await supabase
          .from('user_invitations' as any)
          .update(updateData)
          .eq('id', invitation.id);

        toast({
          title: "Conta criada com sucesso!",
          description: "Sua conta foi criada. Você pode fazer login agora.",
        });

        navigate('/login');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro no registro",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (validatingInvite) {
    return (
      <div className="min-h-screen w-full bg-muted/30 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Validando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen w-full bg-muted/30 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Convite Inválido</h2>
              <p className="text-muted-foreground mb-4">{inviteError}</p>
              <Button onClick={() => navigate('/login')}>
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-muted/30 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <CardTitle>Convite Válido</CardTitle>
          <CardDescription>
            Você foi convidado por {invitation?.invited_by_name} para se juntar como {invitation?.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
