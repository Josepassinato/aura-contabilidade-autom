
import { useContext } from 'react';
import { AuthContext } from "@/contexts/auth/AuthContext";
import { useAuth } from "@/contexts/auth";

export const useSidebarPermissions = () => {
  // Try to use the official hook first
  try {
    // Use the proper useAuth hook which has error handling built in
    const { isAccountant, isAdmin } = useAuth();
    
    // Accountants and admins can view certain sections
    const isAccountantOrAdmin = isAccountant || isAdmin;
    
    return { isAccountantOrAdmin };
  } catch (error) {
    // Fallback to manual context if the hook fails (should not happen in normal circumstances)
    console.warn("Falling back to manual context check in useSidebarPermissions");
    
    // Verify if the context is available without throwing an error
    const authContext = useContext(AuthContext);
    
    // If the context isn't available, return default values
    if (!authContext) {
      console.warn("AuthContext não disponível em useSidebarPermissions. O componente pode não estar dentro de um AuthProvider.");
      return { isAccountantOrAdmin: false };
    }
    
    try {
      const isAccountant = authContext.isAccountant || false;
      const isAdmin = authContext.isAdmin || false;
      
      // Accountants and admins can view certain sections
      const isAccountantOrAdmin = isAccountant || isAdmin;
      
      return { isAccountantOrAdmin };
    } catch (error) {
      console.error("Erro em useSidebarPermissions:", error);
      // Return default values to prevent UI breaking
      return { isAccountantOrAdmin: false };
    }
  }
};

export default useSidebarPermissions;
