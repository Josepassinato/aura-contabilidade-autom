
import { useAuth } from "@/contexts/auth";

export const useSidebarPermissions = () => {
  const { isAccountant, isAdmin } = useAuth();
  
  // Accountants and admins can view certain sections
  const isAccountantOrAdmin = isAccountant || isAdmin;
  
  return { isAccountantOrAdmin };
};
