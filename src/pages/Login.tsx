
import React from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/supabase';
import { LogIn, User, Building } from 'lucide-react';

// Schema para validação do formulário de login
const loginFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

// Schema para validação do formulário de cadastro
const signupFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
  role: z.enum(['accountant', 'client'], { 
    required_error: "Selecione um tipo de usuário",
  }),
  company: z.string().optional(),
  cnpj: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
type SignupFormValues = z.infer<typeof signupFormSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, isAccountant, isClient } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("login");

  React.useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated) {
      if (isAccountant) {
        navigate('/');
      } else if (isClient) {
        navigate('/client-portal');
      }
    }
  }, [isAuthenticated, isAccountant, isClient, navigate]);
  
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
      const { error } = await signIn(data.email, data.password);
      
      if (!error) {
        // Redirect will happen in useEffect when auth state changes
      }
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
        setActiveTab("login");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCNPJ = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, "");
    
    // Formato CNPJ: XX.XXX.XXX/YYYY-ZZ
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
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
