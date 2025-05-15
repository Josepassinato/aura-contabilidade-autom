
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { UserProfile, UserRole } from '@/lib/supabase';
import { supabase, supabaseAuth, getUserProfile } from '@/lib/supabaseService';
import { toast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';
import { cleanupAuthState, checkForAuthLimboState } from './cleanupUtils';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Inicialização e configuração de listener para mudanças de autenticação
  useEffect(() => {
    setIsLoading(true);
    
    // Verificar e relatar estados de limbo potenciais
    checkForAuthLimboState();
    
    // 1. Configurar listener de eventos de autenticação primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event);
      
      // Atualizar estados de sessão e usuário imediatamente (síncrono)
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsAuthenticated(!!newSession);
      
      // Se ocorreu um login, buscar dados adicionais de forma assíncrona usando setTimeout
      if (event === 'SIGNED_IN' && newSession?.user) {
        setTimeout(() => {
          fetchUserProfile(newSession.user.id);
        }, 0);
      }
      
      // Se ocorreu um logout, limpar dados do perfil
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    });
    
    // 2. Verificar sessão existente
    const initializeAuth = async () => {
      try {
        // Verificar role no localStorage para teste
        const userRole = localStorage.getItem('user_role');
        const hasMockSession = localStorage.getItem('mock_session') === 'true' || userRole !== null;
        
        if (hasMockSession) {
          // Configuração para ambiente de teste/demo
          setupMockSession(userRole || 'accountant');
        } else {
          // Verificar sessão real do Supabase
          const { data: { session: existingSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (existingSession) {
            setSession(existingSession);
            setUser(existingSession.user);
            setIsAuthenticated(true);
            
            // Buscar perfil adicional usando setTimeout para evitar deadlocks
            setTimeout(() => {
              fetchUserProfile(existingSession.user.id);
            }, 0);
          } else {
            setIsAuthenticated(false);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Buscar perfil de usuário adicional
  const fetchUserProfile = async (userId: string) => {
    try {
      if (!userId) return;
      
      // Para ambiente de teste/demo, usar perfil mock
      if (localStorage.getItem('mock_session') === 'true') {
        return;
      }
      
      const profile = await getUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  // Configurar sessão mock para ambiente de teste/demo
  const setupMockSession = (role: string) => {
    const mockUser = {
      id: '123',
      email: role === 'client' ? 'cliente@empresa.com.br' : 
              role === 'admin' ? 'admin@contaflix.com.br' : 'contador@contaflix.com.br',
      user_metadata: {
        name: role === 'client' ? 'Empresa Cliente' : 
              role === 'admin' ? 'Admin Contaflix' : 'Contador Teste',
      }
    };
    
    const mockProfile = {
      id: '123',
      email: mockUser.email,
      name: mockUser.user_metadata.name,
      role: (role as UserRole) || 'accountant',
      full_name: mockUser.user_metadata.name,
      company_id: role === 'client' ? 'client-123' : 'contaflix-001'
    };
    
    setUser(mockUser as User);
    setSession({ user: mockUser } as Session);
    setUserProfile(mockProfile);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Para ambiente de teste/demo
      if (email && password) {
        let role = 'accountant';
        let name = 'Contador Teste';
        
        if (email.includes('cliente')) {
          role = 'client';
          name = 'Empresa Cliente';
        } else if (email.includes('admin')) {
          role = 'admin';
          name = 'Admin Contaflix';
        }
        
        // Limpar estado de autenticação anterior
        cleanupAuthState();
        
        // Configurar sessão mock
        localStorage.setItem('mock_session', 'true');
        localStorage.setItem('user_role', role);
        
        // Criar mock do usuário e sessão
        setupMockSession(role);
        
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
    } finally {
      setIsLoading(false);
    }
  };

  // Logout com limpeza completa
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Limpar dados de sessão mock
      cleanupAuthState();
      
      // Resetar estados
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
      
      // Forçar limpeza em caso de erro
      cleanupAuthState();
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  // Adaptadores para a API do AuthContext
  const signIn = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      return { error: result.success ? null : new Error(result.error) };
    } catch (error) {
      console.error('Erro no SignIn:', error);
      toast({
        title: "Falha no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return { error: new Error('Falha na autenticação') };
    }
  };

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
      toast({
        title: "Erro no cadastro",
        description: "Credenciais inválidas",
        variant: "destructive"
      });
      return { error: new Error('Credenciais inválidas') };
    } catch (error) {
      console.error('Erro no SignUp:', error);
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Não foi possível criar sua conta",
        variant: "destructive"
      });
      return { error: new Error('Falha no cadastro') };
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no SignOut:', error);
      toast({
        title: "Erro ao sair",
        description: error instanceof Error ? error.message : "Falha ao fazer logout",
        variant: "destructive"
      });
      
      // Forçar limpeza e redirecionamento em caso de erro
      cleanupAuthState();
      window.location.href = '/login';
    }
  };

  // Determinar roles com base no perfil
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
