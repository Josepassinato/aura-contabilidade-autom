
import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    // Garante que userProfile esteja sempre acessível
    userProfile: context.userProfile || context.profile,
    // Garante que todos os métodos de autenticação estejam disponíveis
    signIn: context.signIn || context.login,
    signOut: context.signOut || context.logout,
    // We need to make sure the return type matches the expected type in AuthContextType
    // By wrapping any non-void function to return void
    logout: async () => {
      const result = await (context.logout || context.signOut)();
      return;
    },
    login: async () => {
      const result = await (context.login || context.signIn)();
      return;
    },
    // Mantém as verificações de perfil
    isAdmin: context.isAdmin || localStorage.getItem('user_role') === 'admin',
    isAccountant: context.isAccountant || localStorage.getItem('user_role') === 'accountant',
    isClient: context.isClient || localStorage.getItem('user_role') === 'client'
  };
};
