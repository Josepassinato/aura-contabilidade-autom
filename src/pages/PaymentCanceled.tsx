
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/navigation/BackButton";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 mb-4 text-red-600">
              <XCircle className="w-full h-full" />
            </div>
            <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>
              O processo de pagamento foi cancelado. Nenhum valor foi cobrado.
              Se você encontrou algum problema durante o checkout, nossa equipe está 
              à disposição para ajudar.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => navigate("/planos")}>
              Tentar Novamente
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/contact")}>
              Entrar em Contato
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCanceled;
