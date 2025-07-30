import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AuthService } from '@/services/auth/authService';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof formSchema>;

interface PasswordResetFormProps {
  onBack: () => void;
}

export function PasswordResetForm({ onBack }: PasswordResetFormProps) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      const { error } = await AuthService.resetPasswordForEmail(data.email);
      
      if (error) {
        toast({
          title: 'Erro ao enviar email',
          description: error.message || 'Não foi possível enviar o email de redefinição',
          variant: 'destructive',
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error in password reset:', error);
      toast({
        title: 'Erro no sistema',
        description: 'Não foi possível processar sua solicitação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Email enviado!</h3>
          <p className="text-sm text-muted-foreground">
            Enviamos um link para redefinição de senha para seu email.
            Verifique sua caixa de entrada e spam.
          </p>
        </div>
        <Button onClick={onBack} variant="outline" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Redefinir senha</h3>
        <p className="text-sm text-muted-foreground">
          Digite seu email para receber um link de redefinição de senha
        </p>
      </div>

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
                    placeholder="seu@email.com"
                    type="email"
                    {...field}
                    disabled={loading}
                    className="h-12 text-base transition-smooth focus:shadow-glow"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full h-12 font-medium bg-gradient-primary hover:shadow-glow transition-smooth" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de redefinição'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onBack}
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}