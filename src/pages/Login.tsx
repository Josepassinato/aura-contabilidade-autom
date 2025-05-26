
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
    <div className="min-h-screen bg-muted/30 p-3 sm:p-6 sm:flex sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-sm sm:mx-auto">
        <div className="mb-3 sm:mb-6">
          <BackButton />
        </div>
        
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-3xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-2 sm:mt-2 text-base sm:text-base">Sistema de gestão contábil</p>
        </div>
        
        <Card className="border shadow-lg">
          <CardHeader className="px-4 py-6 sm:px-6 sm:py-6">
            <CardTitle className="text-xl sm:text-xl">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-sm sm:text-sm mt-2">
              Faça login ou cadastre-se para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pb-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10 mb-6 sm:mb-6">
                <TabsTrigger value="login" className="text-sm sm:text-sm font-medium">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm sm:text-sm font-medium">Cadastro</TabsTrigger>
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
          
          <CardFooter className="px-4 py-6 sm:px-6 sm:py-6">
            <AuthFooter />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
