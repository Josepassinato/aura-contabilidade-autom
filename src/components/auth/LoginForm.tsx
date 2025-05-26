
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Limpar qualquer estado de autenticação anterior para evitar conflitos
      cleanupAuthState();
      
      const result = await enhancedLogin(data.email, data.password);
      
      if (result?.success) {
        console.log('Login successful, navigating to dashboard');
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="seu@email.com"
                  type="email"
                  {...field}
                  autoComplete="email"
                  disabled={loading}
                  className="h-20 text-2xl px-4 py-4"
                />
              </FormControl>
              <FormMessage className="text-xl" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl font-medium">Senha</FormLabel>
              <FormControl>
                <Input
                  placeholder="******"
                  type="password"
                  {...field}
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-20 text-2xl px-4 py-4"
                />
              </FormControl>
              <FormMessage className="text-xl" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-20 text-2xl font-medium mt-8" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
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
