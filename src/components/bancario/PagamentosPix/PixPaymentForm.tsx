
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { triggerPixPayment } from "@/services/bancario/pixService";

interface PixPaymentFormProps {
  clientId: string;
  onSuccess?: () => void;
}

export function PixPaymentForm({ clientId, onSuccess }: PixPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pixKey: "",
    amount: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pixKey || !formData.amount || !formData.description) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos para continuar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const result = await triggerPixPayment({
        clientId,
        pixKey: formData.pixKey,
        amount: formData.amount,
        description: formData.description,
      });
      
      toast({
        title: "Pagamento Pix iniciado",
        description: `Transação: ${result.payment.transactionId}`,
      });
      
      // Limpar formulário
      setFormData({
        pixKey: "",
        amount: "",
        description: "",
      });
      
      // Chamar callback de sucesso se existir
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro no pagamento Pix:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via Pix</CardTitle>
        <CardDescription>
          Realize pagamentos automáticos via Pix para fornecedores ou serviços
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave Pix</Label>
            <Input
              id="pixKey"
              name="pixKey"
              placeholder="CPF, CNPJ, E-mail ou Chave Aleatória"
              value={formData.pixKey}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              name="amount"
              placeholder="0,00"
              value={formData.amount}
              onChange={handleChange}
              disabled={isLoading}
              type="text"
              inputMode="decimal"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              placeholder="Pagamento para..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <Separator className="my-4" />
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Realizar Pagamento Pix"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
