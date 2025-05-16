import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/supabase';
import { LogIn, User, Building } from 'lucide-react';
import { formatCNPJ } from '@/components/client-access/formatCNPJ';
import { cleanupAuthState } from '@/contexts/auth/cleanupUtils';
import { useToast } from '@/hooks/use-toast';

// Schema para validação do formulário de login
const loginFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

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

// Schema para validação do formulário de cadastro
const signupFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
  role: z.enum(['accountant', 'client'], { 
    required_error: "Selecione um tipo de usuário",
  }),
  company: z.string().optional(),
  cnpj: z.string()
    .optional()
    .refine(val => !val || validateCNPJ(val), { 
      message: "CNPJ inválido"
    }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type SignupFormValues = z.infer<typeof signupFormSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, isAccountant, isAdmin, isClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  React.useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/business-analytics', { replace: true });
      } else if (isAccountant) {
        navigate('/dashboard', { replace: true });
      } else if (isClient) {
        navigate('/client-portal', { replace: true });
      }
    }
  }, [isAuthenticated, isAccountant, isAdmin, isClient, navigate]);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "client",
      company: "",
      cnpj: "",
    },
  });
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Clean up any existing auth state first
      cleanupAuthState();
      
      const { error } = await signIn(data.email, data.password);
      
      if (!error) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        
        // Redirection will be handled by the useEffect above
      } else {
        toast({
          title: "Falha no login",
          description: error.message || "Credenciais inválidas",
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
  
  const onSignupSubmit = async (data: SignupFormValues) => {
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
        setActiveTab("login");
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
  
  // Função para login rápido como contador para teste
  const loginAsAccountant = () => {
    setIsLoading(true);
    // Clean up any existing auth state first
    cleanupAuthState();
    
    try {
      // Set up mock session for accountant
      localStorage.setItem('mock_session', 'true');
      localStorage.setItem('user_role', 'accountant');
      
      // Create a toast notification
      toast({
        title: "Login como contador",
        description: "Acessando como Contador Teste",
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
      window.location.reload();
    } catch (error) {
      console.error("Erro no login como contador:", error);
      toast({
        title: "Falha no acesso",
        description: "Não foi possível acessar como contador",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Função para login rápido como cliente para teste
  const loginAsClient = () => {
    setIsLoading(true);
    // Clean up any existing auth state first
    cleanupAuthState();
    
    try {
      // Set up mock session for client
      localStorage.setItem('mock_session', 'true');
      localStorage.setItem('user_role', 'client');
      
      // Create a toast notification
      toast({
        title: "Login como cliente",
        description: "Acessando como Empresa Cliente",
      });
      
      // Navigate to client portal
      navigate("/client-portal");
      window.location.reload();
    } catch (error) {
      console.error("Erro no login como cliente:", error);
      toast({
        title: "Falha no acesso",
        description: "Não foi possível acessar como cliente",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Função para login rápido como admin para teste
  const loginAsAdmin = () => {
    setIsLoading(true);
    // Clean up any existing auth state first
    cleanupAuthState();
    
    try {
      // Set up mock session for admin
      localStorage.setItem('mock_session', 'true');
      localStorage.setItem('user_role', 'admin');
      
      // Create a toast notification
      toast({
        title: "Login como admin",
        description: "Acessando como Admin Contaflix",
      });
      
      // Navigate to admin analytics
      navigate("/admin/analytics");
      window.location.reload();
    } catch (error) {
      console.error("Erro no login como admin:", error);
      toast({
        title: "Falha no acesso",
        description: "Não foi possível acessar como admin",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    signupForm.setValue("cnpj", formattedCNPJ);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-2">Sistema de gestão contábil</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Faça login ou cadastre-se para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={loginForm.control}
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
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Acesso rápido para testes:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loginAsAccountant} 
                      disabled={isLoading}
                    >
                      Contador
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loginAsClient} 
                      disabled={isLoading}
                    >
                      Cliente
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loginAsAdmin} 
                      disabled={isLoading}
                    >
                      Admin
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={signupForm.control}
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
                      control={signupForm.control}
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
                      control={signupForm.control}
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
                      control={signupForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Usuário</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              type="button"
                              variant={field.value === 'accountant' ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => signupForm.setValue('role', 'accountant')}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Contador
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'client' ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => signupForm.setValue('role', 'client')}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              Cliente
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {signupForm.watch('role') === 'client' && (
                      <>
                        <FormField
                          control={signupForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nome da sua empresa"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
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
                                Digite um CNPJ válido ou deixe em branco
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
            <p>Ao acessar o sistema, você concorda com nossos termos de uso.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
