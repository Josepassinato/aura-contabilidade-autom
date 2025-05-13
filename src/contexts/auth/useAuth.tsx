
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Add a function to navigate to login page
  const navigateToLogin = () => {
    console.info("Navegando para a página de login...");
    try {
      // First try using React Router's navigate
      navigate("/login");
    } catch (error) {
      console.error("Erro ao navegar com useNavigate:", error);
      // Fallback to window.location if navigate fails
      window.location.href = "/login";
    }
  };

  return {
    ...context,
    navigateToLogin
  };
};
