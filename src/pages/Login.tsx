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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-3 sm:p-4">
      <div className="w-full max-w-lg sm:max-w-md">
        <div className="mb-3 sm:mb-4">
          <BackButton />
        </div>
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-3xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-2 sm:mt-2 text-base sm:text-base">Sistema de gestão contábil</p>
        </div>
        
        <Card className="border-0 sm:border shadow-lg sm:shadow-sm">
          <CardHeader className="px-6 py-6 sm:px-6 sm:py-6">
            <CardTitle className="text-xl sm:text-xl">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-base sm:text-sm">
              Faça login ou cadastre-se para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10">
                <TabsTrigger value="login" className="text-base sm:text-sm">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-base sm:text-sm">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-6 sm:mt-6">
                <LoginForm />
                <QuickLoginButtons />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6 sm:mt-6">
                <SignupForm onSuccess={handleSignupSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="px-6 py-6 sm:px-6 sm:py-6">
            <AuthFooter />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
