import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Brain, Code, CheckCircle, AlertCircle, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedRule {
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
    description: string;
  }>;
  actions: Array<{
    type: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  confidence: number;
  explanation: string;
}

interface NaturalLanguageRuleBuilderProps {
  onRuleGenerated?: (rule: GeneratedRule) => void;
}

export function NaturalLanguageRuleBuilder({ onRuleGenerated }: NaturalLanguageRuleBuilderProps) {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRule, setGeneratedRule] = useState<GeneratedRule | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const examplePrompts = [
    "Quando um documento de nota fiscal for carregado, classifique automaticamente como receita e notifique o contador",
    "Se o valor de uma transação for maior que R$ 10.000, marque para revisão manual e envie alerta",
    "Para documentos de despesa mensal, categorize por tipo e atualize o relatório de custos",
    "Quando detectar duplicata de lançamento, bloqueie a entrada e notifique o usuário"
  ];

  const generateRule = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, descreva a regra que deseja criar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-automation-rule', {
        body: {
          naturalLanguageInput: userInput,
          context: "accounting_automation"
        }
      });

      if (error) throw error;

      const rule: GeneratedRule = data.rule;
      setGeneratedRule(rule);
      setShowPreview(true);
      
      toast({
        title: "Regra gerada com sucesso",
        description: `Regra "${rule.name}" criada com ${(rule.confidence * 100).toFixed(0)}% de confiança.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar regra:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar a regra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmRule = () => {
    if (generatedRule) {
      onRuleGenerated?.(generatedRule);
      setUserInput('');
      setGeneratedRule(null);
      setShowPreview(false);
      
      toast({
        title: "Regra confirmada",
        description: "A regra foi adicionada ao sistema de automação.",
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "Alta";
    if (confidence >= 0.6) return "Média";
    return "Baixa";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Criador de Regras em Linguagem Natural
          </CardTitle>
          <CardDescription>
            Descreva sua regra de automação em linguagem natural e a IA criará a configuração técnica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descreva a regra de automação que deseja criar:
            </label>
            <Textarea
              placeholder="Ex: Quando um documento de nota fiscal for carregado, classifique automaticamente e notifique o contador..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={generateRule}
              disabled={isGenerating || !userInput.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Gerar Regra
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Exemplos de prompts:</h4>
            <div className="grid gap-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setUserInput(prompt)}
                  className="text-left text-sm text-muted-foreground hover:text-foreground p-2 rounded border border-dashed border-muted hover:border-border transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && generatedRule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Regra Gerada
            </CardTitle>
            <CardDescription>
              Revise a regra gerada pela IA antes de confirmar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{generatedRule.name}</h3>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${getConfidenceColor(generatedRule.confidence)}`}>
                  Confiança: {getConfidenceText(generatedRule.confidence)} ({(generatedRule.confidence * 100).toFixed(0)}%)
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{generatedRule.description}</p>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Condições
                </h4>
                <div className="space-y-2">
                  {generatedRule.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{condition.field}</Badge>
                      <span className="text-muted-foreground">{condition.operator}</span>
                      <code className="px-2 py-1 bg-muted rounded text-xs">{condition.value}</code>
                      <span className="text-muted-foreground">— {condition.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Ações
                </h4>
                <div className="space-y-2">
                  {generatedRule.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge>{action.type}</Badge>
                      <span className="text-muted-foreground">{action.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-1">Explicação da IA:</h4>
                <p className="text-sm text-muted-foreground">{generatedRule.explanation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={confirmRule} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirmar Regra
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                Editar Prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}