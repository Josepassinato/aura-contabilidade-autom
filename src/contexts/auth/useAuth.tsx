
import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    // Simulando propriedades de permissões para desenvolvimento
    isAdmin: context.isAdmin || localStorage.getItem('user_role') === 'admin',
    isAccountant: context.isAccountant || localStorage.getItem('user_role') === 'accountant',
    isClient: context.isClient || localStorage.getItem('user_role') === 'client'
  };
};
