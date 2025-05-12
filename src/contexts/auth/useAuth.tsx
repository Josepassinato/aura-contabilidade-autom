
import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Função auxiliar para garantir que o retorno seja void
  const wrapVoidReturn = async (fn: any, ...args: any[]): Promise<void> => {
    await fn(...args);
    return;
  }

  // Função auxiliar para garantir o retorno no formato de success/error
  const wrapSuccessReturn = async (fn: any, ...args: any[]): Promise<{success: boolean, error: any}> => {
    try {
      const result = await fn(...args);
      // Se o resultado já tiver o formato correto, retorne-o diretamente
      if (result && typeof result === 'object' && 'success' in result) {
        return { 
          success: result.success, 
          error: result.error || null 
        };
      }
      // Caso contrário, envolva em um objeto de sucesso
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  // Preparar as funções com os tipos corretos
  const loginFn = (email: string, password: string) => 
    wrapSuccessReturn(context.login || context.signIn, email, password);
    
  const logoutFn = () => 
    wrapVoidReturn(context.logout || context.signOut);
  
  return {
    ...context,
    // Garante que userProfile esteja sempre acessível
    userProfile: context.userProfile || context.profile,
    // Garante que todos os métodos de autenticação estejam disponíveis com os tipos corretos
    signIn: context.signIn || context.login,
    signOut: context.signOut || context.logout,
    // Adapta as funções opcionais para terem o tipo de retorno correto
    logout: logoutFn,
    login: loginFn,
    // Mantém as verificações de perfil
    isAdmin: context.isAdmin || localStorage.getItem('user_role') === 'admin',
    isAccountant: context.isAccountant || localStorage.getItem('user_role') === 'accountant',
    isClient: context.isClient || localStorage.getItem('user_role') === 'client'
  };
};
