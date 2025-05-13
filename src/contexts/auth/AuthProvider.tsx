import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useSupabaseClient, UserProfile, UserRole } from '@/lib/supabase';
import { getUserProfile, mapUserToProfile, signOut, signInWithEmail } from './authUtils';
import { toast } from '@/hooks/use-toast';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Verificar role no localStorage para teste
        const userRole = localStorage.getItem('user_role');
        const mockSessionUser = {
          id: '123',
          email: userRole === 'client' ? 'cliente@empresa.com.br' : 
                userRole === 'admin' ? 'admin@contaflix.com.br' : 'contador@contaflix.com.br',
          user_metadata: {
            name: userRole === 'client' ? 'Empresa Cliente' : 
                  userRole === 'admin' ? 'Admin Contaflix' : 'Contador Teste',
          }
        };
        
        // Para testes/demonstração
        const hasSession = localStorage.getItem('mock_session') === 'true' || userRole !== null;
        
        if (hasSession) {
          // Configurar sessão e usuário
          setSession({ user: mockSessionUser });
          setUser(mockSessionUser);
          
          // Criar perfil baseado no role salvo no localStorage
          const mockProfile = {
            id: mockSessionUser.id,
            email: mockSessionUser.email,
            name: mockSessionUser.user_metadata.name,
            role: (userRole || 'accountant'),
            full_name: mockSessionUser.user_metadata.name,
            company_id: userRole === 'client' ? 'client-123' : 'contaflix-001'
          };
          
          setUserProfile(mockProfile);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock login para testes
      if (email && password) {
        // Determinar o perfil baseado no email
        let role = 'accountant';
        let name = 'Contador Teste';
        
        if (email.includes('cliente')) {
          role = 'client';
          name = 'Empresa Cliente';
        } else if (email.includes('admin')) {
          role = 'admin';
          name = 'Admin Contaflix';
        }
        
        // Configurar sessão mock
        localStorage.setItem('mock_session', 'true');
        localStorage.setItem('user_role', role);
        
        // Criar usuário mock
        const mockUser = {
          id: '123',
          email: email,
          user_metadata: {
            name: name,
          }
        };

        const mockProfile = {
          id: '123',
          email: email,
          name: name,
          role: role,
          full_name: name,
          company_id: role === 'client' ? 'client-123' : 'contaflix-001'
        };
        
        setUser(mockUser);
        setSession({ user: mockUser });
        setUserProfile(mockProfile);
        setIsAuthenticated(true);
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo, ${name}!`,
        });
        
        return { success: true, error: null };
      }
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Falha no login",
        description: "Não foi possível efetuar o login",
        variant: "destructive"
      });
      return { success: false, error: 'Falha na autenticação' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('mock_session');
      localStorage.removeItem('user_role');
      setIsAuthenticated(false);
      setUserProfile(null);
      setSession(null);
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive"
      });
    }
  };

  // Implementar signIn para corresponder ao AuthContextType
  const signIn = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      return { error: result.success ? null : new Error(result.error) };
    } catch (error) {
      console.error('Erro no SignIn:', error);
      return { error: new Error('Falha na autenticação') };
    }
  };

  // Implementar signUp para corresponder ao AuthContextType
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Mock signup para testes
      if (email && password) {
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada com sucesso",
        });
        
        await login(email, password);
        return { error: null };
      }
      return { error: new Error('Credenciais inválidas') };
    } catch (error) {
      console.error('Erro no SignUp:', error);
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível criar sua conta",
        variant: "destructive"
      });
      return { error: new Error('Falha no cadastro') };
    }
  };

  // Atualizar handleSignOut para corresponder ao tipo de retorno void
  const handleSignOut = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no SignOut:', error);
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isAccountant = userProfile?.role === 'accountant' || isAdmin;
  const isClient = userProfile?.role === 'client';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile: userProfile,
        userProfile,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut: handleSignOut,
        isAdmin,
        isAccountant,
        isClient,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
