
import { useAuth } from "@/contexts/auth";

export const useSidebarPermissions = () => {
  try {
    const { isAccountant, isAdmin } = useAuth();
    
    // Accountants and admins can view certain sections
    const isAccountantOrAdmin = isAccountant || isAdmin;
    
    return { isAccountantOrAdmin };
  } catch (error) {
    console.error("Error in useSidebarPermissions:", error);
    // Return default values to prevent UI breaking
    return { isAccountantOrAdmin: false };
  }
};
