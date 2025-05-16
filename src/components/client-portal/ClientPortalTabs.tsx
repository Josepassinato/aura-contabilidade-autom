
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, InfoIcon, FileText, BarChart3 } from "lucide-react";

// Componente para dicas do assistente
const AssistantHint = ({ text }: { text: string }) => (
  <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2 text-sm">
    <Mic className="h-4 w-4 text-primary mt-0.5" />
    <p className="text-muted-foreground">{text}</p>
  </div>
);

// Componente para exemplos de comandos
const ExampleCard = ({ title, examples }: { title: string; examples: string[] }) => (
  <Card className="p-4">
    <h3 className="font-medium mb-2">{title}</h3>
    <ul className="space-y-2 text-sm">
      {examples.map((example, i) => (
        <li key={i} className="text-muted-foreground flex items-center gap-2">
          <Mic className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span>"{example}"</span>
        </li>
      ))}
    </ul>
  </Card>
);

interface ClientPortalTabsProps {
  toggleAssistant?: () => void;
}

export const ClientPortalTabs = ({ toggleAssistant }: ClientPortalTabsProps) => {
  return (
    <Tabs defaultValue="assistant" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="assistant">
          <Mic className="h-4 w-4 mr-2" />
          Assistente IA
        </TabsTrigger>
        <TabsTrigger value="fiscal">
          <InfoIcon className="h-4 w-4 mr-2" />
          Obrigações Fiscais
        </TabsTrigger>
        <TabsTrigger value="accounting">
          <FileText className="h-4 w-4 mr-2" />
          Contabilidade
        </TabsTrigger>
        <TabsTrigger value="reports">
          <BarChart3 className="h-4 w-4 mr-2" />
          Relatórios
        </TabsTrigger>
      </TabsList>
      
      <div className="p-4 border rounded-lg">
        <TabsContent value="assistant" className="mt-0">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Mic className="h-5 w-5 mr-2 text-primary" />
            Assistente Virtual Contábil
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Seu assistente virtual tem acesso às informações específicas da sua empresa e está pronto para
            ajudar com consultas sobre sua contabilidade, obrigações fiscais e relatórios financeiros.
            Basta clicar no botão do assistente e fazer suas perguntas por voz ou texto.
          </p>
          
          {toggleAssistant && (
            <div className="mb-8 flex justify-center">
              <Button onClick={toggleAssistant} className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Conversar com o Assistente
              </Button>
            </div>
          )}
          
          <h3 className="font-medium text-lg mb-3">O que você pode perguntar:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ExampleCard 
              title="Informações Fiscais"
              examples={[
                "Quais são minhas obrigações fiscais deste mês?",
                "Quando vence meu próximo imposto?",
                "Qual o valor do ICMS a pagar?"
              ]}
            />
            
            <ExampleCard 
              title="Relatórios Financeiros"
              examples={[
                "Mostre meu balanço patrimonial",
                "Como está meu fluxo de caixa?",
                "Qual foi meu faturamento do último trimestre?"
              ]}
            />
            
            <ExampleCard 
              title="Análises e Projeções"
              examples={[
                "Detecte anomalias nos meus lançamentos contábeis",
                "Analise minha margem de lucro",
                "Projete meu fluxo de caixa para o próximo mês"
              ]}
            />
            
            <ExampleCard 
              title="Documentos e Conformidade"
              examples={[
                "Quais documentos estão pendentes de envio?",
                "Minha empresa está em conformidade fiscal?",
                "Preciso enviar alguma declaração este mês?"
              ]}
            />
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h4 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              Importante
            </h4>
            <p className="text-sm text-muted-foreground">
              O assistente tem acesso apenas aos dados da sua empresa e é projetado para 
              manter suas informações seguras. Todas as informações fornecidas são específicas 
              para seu negócio e baseadas nos dados disponíveis em nosso sistema.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="fiscal" className="mt-0">
          <h2 className="text-xl font-medium mb-4">Calendário Fiscal</h2>
          <p className="text-muted-foreground mb-4">
            Aqui você encontra todas as suas obrigações fiscais, prazos e valores.
            Fale com a assistente de IA para obter detalhes específicos.
          </p>
          <AssistantHint 
            text="Pergunte à assistente: 'Quais são minhas obrigações fiscais para este mês?' ou 'Quando vence o ICMS?'" 
          />
        </TabsContent>
        
        <TabsContent value="accounting" className="mt-0">
          <h2 className="text-xl font-medium mb-4">Registros Contábeis</h2>
          <p className="text-muted-foreground mb-4">
            Visualize seus demonstrativos contábeis, balancetes e outros documentos.
            A assistente de IA pode gerar relatórios personalizados conforme sua necessidade.
          </p>
          <AssistantHint 
            text="Pergunte à assistente: 'Mostre meu balanço patrimonial' ou 'Como está meu fluxo de caixa?'" 
          />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-0">
          <h2 className="text-xl font-medium mb-4">Relatórios Gerenciais</h2>
          <p className="text-muted-foreground mb-4">
            Acompanhe indicadores financeiros e relatórios gerenciais da sua empresa.
            Pergunte à assistente de IA para analisar tendências e oportunidades.
          </p>
          <AssistantHint 
            text="Pergunte à assistente: 'Gere um relatório de faturamento dos últimos 3 meses' ou 'Como está minha margem de lucro?'" 
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
