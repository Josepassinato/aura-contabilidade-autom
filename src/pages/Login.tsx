
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

import { cleanupAuthState, checkForAuthLimboState } from '@/contexts/auth/cleanupUtils';
import { BackButton } from '@/components/navigation/BackButton';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAccountant, isAdmin, isClient } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

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

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 p-4 flex flex-col relative overflow-hidden">
      {/* Background decoration with bright colors */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400/40 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400/50 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-400/30 rounded-full blur-lg animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-indigo-400/30 rounded-full blur-xl animate-pulse"></div>
      
      <div className="flex-1 flex flex-col w-full relative z-10">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">contaflows</h1>
          <p className="text-gray-700 mt-3 text-3xl sm:text-4xl font-light">Sistema de gestão contábil</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="border shadow-2xl w-full bg-white/95 backdrop-blur-md border-purple-200/50 border-2">
            <CardHeader className="p-8">
              <CardTitle className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-2xl sm:text-3xl mt-3 text-gray-600">
                Faça login ou cadastre-se para acessar o sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 pt-0">
              {showPasswordReset ? (
                <PasswordResetForm onBack={handleBackToLogin} />
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 h-20 mb-8 bg-gradient-to-r from-purple-100 to-cyan-100">
                    <TabsTrigger value="login" className="text-2xl sm:text-3xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="text-2xl sm:text-3xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Cadastro</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-0">
                    <LoginForm onForgotPassword={handleForgotPassword} />
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-0">
                    <SignupForm onSuccess={handleSignupSuccess} />
                  </TabsContent>
                </Tabs>
              )}
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
