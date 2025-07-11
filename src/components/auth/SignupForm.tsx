
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User, Building, Crown, UserCheck, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/supabase';
import { formatCNPJ } from '@/components/client-access/formatCNPJ';

// Função para validar CNPJ
const validateCNPJ = (value: string) => {
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, "");
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) {
    return false;
  }

  // Validação básica: verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) {
    return false;
  }

  // Implementação do algoritmo de validação de CNPJ
  let size = numbers.length - 2;
  let numbers_array = numbers.substring(0, size);
  const digits = numbers.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  size = size + 1;
  numbers_array = numbers.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
};

// Schema para validação do formulário de cadastro (sem admin para cadastro público)
const signupFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
  role: z.enum(['accountant', 'client'], { 
    required_error: "Selecione um tipo de usuário",
  }),
  company: z.string().min(1, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().min(1, { message: "CNPJ é obrigatório" })
    .refine(val => validateCNPJ(val), { 
      message: "CNPJ inválido"
    }),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const SignupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "accountant",
      company: "",
      cnpj: "",
    },
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Prepare user data for profile creation
      const userData = {
        full_name: data.fullName,
        role: data.role as UserRole,
        company_id: data.company || undefined,
      };
      
      const { error } = await signUp(data.email, data.password, userData);
      
      if (!error) {
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada com sucesso!",
        });
        onSuccess();
      } else {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Não foi possível criar sua conta",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no sistema",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    form.setValue("cnpj", formattedCNPJ);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Seu nome completo"
                  {...field}
                />
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
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input 
                  placeholder="seu@email.com"
                  type="email"
                  {...field}
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
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Mínimo 6 caracteres"
                  {...field}
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
              <FormLabel>Tipo de Usuário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base transition-smooth focus:shadow-glow">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border shadow-lg">
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
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch('role') === 'accountant' ? 'Nome do Escritório Contábil' : 'Nome da Empresa'}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={form.watch('role') === 'accountant' ? 'Nome do seu escritório contábil' : 'Nome da sua empresa'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input 
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  {...field}
                  onChange={handleCNPJChange}
                />
              </FormControl>
              <FormDescription>
                CNPJ obrigatório para validação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
};
