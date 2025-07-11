
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, UserCheck, Crown } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { cleanupAuthState } from '@/contexts/auth/cleanupUtils';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  userType: z.enum(['admin', 'accountant', 'client'], {
    required_error: 'Selecione o tipo de usuário',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { enhancedLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      userType: 'accountant' as const,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Limpar qualquer estado de autenticação anterior para evitar conflitos
      cleanupAuthState();
      
      const result = await enhancedLogin(data.email, data.password);
      
      if (result?.success) {
        console.log('Login successful, navigating...');
        // Navegação será tratada pelo enhancedLogin
      } else {
        toast({
          title: 'Falha no login',
          description: result?.error || 'Credenciais inválidas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in login form:', error);
      toast({
        title: 'Erro no sistema',
        description: 'Não foi possível processar sua solicitação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Tipo de Acesso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base transition-smooth focus:shadow-glow">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="admin" className="cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="accountant" className="cursor-pointer">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-blue-500" />
                      <span>Contador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="client" className="cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Empresa</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="seu@email.com"
                  type="email"
                  {...field}
                  autoComplete="email"
                  disabled={loading}
                  className="h-12 text-base transition-smooth focus:shadow-glow"
                />
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
              <FormLabel className="text-sm font-medium">Senha</FormLabel>
              <FormControl>
                <Input
                  placeholder="******"
                  type="password"
                  {...field}
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-12 text-base transition-smooth focus:shadow-glow"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-12 font-medium mt-6 bg-gradient-primary hover:shadow-glow transition-smooth" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </Form>
  );
}
