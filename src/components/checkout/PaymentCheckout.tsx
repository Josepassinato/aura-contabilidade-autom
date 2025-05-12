
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export type PlanDetails = {
  name: string;
  priceId: string;
  price: string;
  interval?: "month" | "year";
};

interface PaymentCheckoutProps {
  plan: PlanDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentCheckout = ({ plan, onSuccess, onCancel }: PaymentCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para continuar com a contratação",
        variant: "destructive",
      });
      // Redirect to login page with return URL
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsLoading(true);

    try {
      // Mock checkout process
      // In a real application, this would call a Stripe checkout endpoint
      toast({
        title: "Processando pagamento",
        description: "Redirecionando para o checkout...",
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful checkout
      console.log(`Checkout for plan: ${plan.name} with price ID: ${plan.priceId}`);
      
      toast({
        title: "Pagamento realizado com sucesso!",
        description: `Você contratou o plano ${plan.name}`,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.",
        variant: "destructive",
      });
      
      if (onCancel) onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Processando..." : `Contratar ${plan.name}`}
    </Button>
  );
};

export default PaymentCheckout;
