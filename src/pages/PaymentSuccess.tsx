
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/navigation/BackButton";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  // If this was a real implementation, we would fetch payment details from query params
  // or use a session ID to verify the payment with our backend
  
  useEffect(() => {
    // In a real implementation: Verify payment status with backend
    console.log("Verifying payment status...");
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 mb-4 text-green-600">
              <CheckCircle className="w-full h-full" />
            </div>
            <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Seu pagamento foi processado com sucesso e sua conta foi ativada.
              Você já pode começar a usar todos os recursos do seu plano.
            </p>
            <p className="text-muted-foreground">
              Um comprovante foi enviado para o seu email.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => navigate("/")}>
              Ir para o Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/configuracoes")}>
              Configurações da Conta
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSuccess;
