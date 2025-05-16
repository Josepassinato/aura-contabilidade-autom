
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { QuickLoginButtons } from '@/components/auth/QuickLoginButtons';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAccountant, isAdmin, isClient } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/analytics', { replace: true });
      } else if (isAccountant) {
        navigate('/dashboard', { replace: true });
      } else if (isClient) {
        navigate('/client-portal', { replace: true });
      }
    }
  }, [isAuthenticated, isAccountant, isAdmin, isClient, navigate]);
  
  const handleSignupSuccess = () => {
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full">
        <AuthHeader />
        
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
                <LoginForm />
                <QuickLoginButtons />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignupForm onSuccess={handleSignupSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter>
            <AuthFooter />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
