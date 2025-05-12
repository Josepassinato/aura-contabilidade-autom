
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, FileText, ArrowRight } from "lucide-react";

const OnboardingWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Bem-vindo ao Contaflix</CardTitle>
          <CardDescription className="text-xl mt-2">
            Vamos configurar seu escritório contábil em poucos passos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Perfil do Escritório</h3>
              <p className="text-sm text-muted-foreground">Configure as informações básicas do seu escritório contábil</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Adicione Clientes</h3>
              <p className="text-sm text-muted-foreground">Cadastre seus primeiros clientes e comece a automatizar a contabilidade</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Integrações</h3>
              <p className="text-sm text-muted-foreground">Configure as integrações fiscais e bancárias para automatizar processos</p>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm"><strong>Dica:</strong> O onboarding leva apenas alguns minutos e vai ajudar você a aproveitar ao máximo as funcionalidades do Contaflix.</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button size="lg" onClick={() => navigate("/onboarding")} className="w-full max-w-xs">
            Começar Configuração <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingWelcome;
