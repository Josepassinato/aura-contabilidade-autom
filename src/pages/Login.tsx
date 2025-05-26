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
    <div className="min-h-screen w-full bg-muted/30 p-2 flex flex-col">
      <div className="flex-1 flex flex-col w-full">
        <div className="mb-2">
          <BackButton />
        </div>
        
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sistema de gestão contábil</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="border shadow-lg w-full max-w-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-xs mt-1">
                Faça login ou cadastre-se para acessar o sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 h-9 mb-4">
                  <TabsTrigger value="login" className="text-xs font-medium">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-xs font-medium">Cadastro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <LoginForm />
                  <QuickLoginButtons />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <SignupForm onSuccess={handleSignupSuccess} />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <AuthFooter />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
