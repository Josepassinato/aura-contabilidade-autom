
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

import { cleanupAuthState, checkForAuthLimboState } from '@/contexts/auth/cleanupUtils';
import { BackButton } from '@/components/navigation/BackButton';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAccountant, isAdmin, isClient } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Clean any stale auth state when the login page loads
  useEffect(() => {
    console.log("Cleaning up auth state on Login page mount");
    cleanupAuthState();
    
    // Check if we have an auth limbo state and clean it up
    if (checkForAuthLimboState()) {
      console.log("Detected and fixed auth limbo state");
    }
  }, []);

  useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated) {
      console.log("User authenticated, redirecting based on role");
      
      if (isAdmin) {
        navigate('/admin/analytics', { replace: true });
      } else if (isAccountant) {
        navigate('/dashboard', { replace: true });
      } else if (isClient) {
        navigate('/client-portal', { replace: true });
      } else {
        // Fallback if no specific role is detected but user is authenticated
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAccountant, isAdmin, isClient, navigate]);
  
  const handleSignupSuccess = () => {
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-secondary p-4 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-brand opacity-20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/40 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-primary-glow/25 rounded-full blur-lg"></div>
      
      <div className="flex-1 flex flex-col w-full relative z-10">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-brand text-6xl sm:text-7xl font-brand tracking-tighter bg-gradient-primary bg-clip-text text-transparent">contaflows</h1>
          <p className="text-body text-muted-foreground mt-3 text-3xl sm:text-4xl font-light">Sistema de gestão contábil</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="border shadow-2xl w-full bg-white/90 backdrop-blur-sm border-primary/20">
            <CardHeader className="p-8">
              <CardTitle className="text-display text-5xl sm:text-6xl bg-gradient-primary bg-clip-text text-transparent">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-body text-2xl sm:text-3xl mt-3 text-muted-foreground">
                Faça login ou cadastre-se para acessar o sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 h-20 mb-8 bg-gradient-secondary">
                  <TabsTrigger value="login" className="text-2xl sm:text-3xl font-medium text-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-2xl sm:text-3xl font-medium text-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cadastro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <SignupForm onSuccess={handleSignupSuccess} />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="p-8 pt-0">
              <AuthFooter />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
