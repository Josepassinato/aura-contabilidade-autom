
import { useContext } from 'react';
import { AuthContext } from "@/contexts/auth";

export const useSidebarPermissions = () => {
  // Verificar se o contexto está disponível sem lançar um erro
  const authContext = useContext(AuthContext);
  
  // Se o contexto não estiver disponível, retornar valores padrão
  if (!authContext) {
    console.warn("AuthContext não disponível em useSidebarPermissions. O componente pode não estar dentro de um AuthProvider.");
    return { isAccountantOrAdmin: false };
  }
  
  try {
    const { isAccountant, isAdmin } = authContext;
    
    // Accountants and admins can view certain sections
    const isAccountantOrAdmin = isAccountant || isAdmin;
    
    return { isAccountantOrAdmin };
  } catch (error) {
    console.error("Erro em useSidebarPermissions:", error);
    // Return default values to prevent UI breaking
    return { isAccountantOrAdmin: false };
  }
};

export default useSidebarPermissions;
