
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const PlansAndPricing = () => {
  const plans = [
    {
      name: "Básico",
      price: "R$ 199/mês",
      description: "Ideal para escritórios pequenos com até 10 clientes",
      features: [
        "Gerenciamento de até 10 clientes",
        "Painel básico para contadores",
        "Geração de guias fiscais",
        "Relatórios básicos",
        "Suporte via email",
      ],
      mostPopular: false,
      ctaText: "Teste grátis por 14 dias",
      ctaLink: "/signup?plan=basic",
    },
    {
      name: "Profissional",
      price: "R$ 399/mês",
      description: "Perfeito para escritórios em crescimento com até 50 clientes",
      features: [
        "Gerenciamento de até 50 clientes",
        "Integrações com Receita Federal",
        "Automação de guias fiscais",
        "Assistente de voz IA limitado",
        "Importação de extratos bancários",
        "Suporte telefônico em horário comercial",
      ],
      mostPopular: true,
      ctaText: "Teste grátis por 14 dias",
      ctaLink: "/signup?plan=professional",
    },
    {
      name: "Enterprise",
      price: "R$ 799/mês",
      description: "A solução completa para grandes escritórios contábeis",
      features: [
        "Clientes ilimitados",
        "Integrações avançadas (RF, Estados, Municípios)",
        "Automação completa de processos",
        "Assistente de voz IA ilimitado",
        "Integração bancária completa",
        "Acesso prioritário a novas funcionalidades",
        "Suporte 24/7 com gerente de conta",
      ],
      mostPopular: false,
      ctaText: "Fale com um consultor",
      ctaLink: "/contact?enterprise=true",
    },
  ];

  return (
    <DashboardLayout>
      <div className="py-10 px-4 md:px-6 space-y-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Escolha o plano ideal para o seu escritório</h1>
          <p className="text-muted-foreground text-lg">
            Todos os planos incluem acesso à plataforma Contaflix com funcionalidades essenciais para 
            transformar a produtividade do seu escritório contábil.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`flex flex-col ${plan.mostPopular ? "border-primary relative" : ""}`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <div className="bg-primary text-primary-foreground py-1 px-3 text-xs font-medium rounded-full">
                    Mais Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl md:text-3xl font-bold">{plan.price}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={plan.ctaLink}>{plan.ctaText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Precisa de ajuda para escolher?</h2>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o plano perfeito para seu escritório.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">Agende uma demonstração</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlansAndPricing;
