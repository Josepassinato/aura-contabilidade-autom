import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TriggerBuilder } from './TriggerBuilder';
import { ActionBuilder } from './ActionBuilder';
import { RulePreview } from './RulePreview';
import { Plus, Save, Eye, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationRuleBuilderProps {
  onRuleCreate?: (rule: any) => void;
  onCancel?: () => void;
  initialRule?: any;
}

export interface RuleData {
  name: string;
  description: string;
  type: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  enabled: boolean;
}

export const AutomationRuleBuilder: React.FC<AutomationRuleBuilderProps> = ({
  onRuleCreate,
  onCancel,
  initialRule
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'basic' | 'trigger' | 'actions' | 'preview'>('basic');
  const [showPreview, setShowPreview] = useState(false);
  
  const [ruleData, setRuleData] = useState<RuleData>({
    name: initialRule?.name || '',
    description: initialRule?.description || '',
    type: initialRule?.type || 'workflow',
    trigger_type: initialRule?.trigger_type || 'scheduled',
    trigger_conditions: initialRule?.trigger_conditions || {},
    actions: initialRule?.actions || [],
    enabled: initialRule?.enabled ?? true
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateRule = (): boolean => {
    const errors: string[] = [];

    if (!ruleData.name.trim()) {
      errors.push('Nome da regra é obrigatório');
    }

    if (!ruleData.description.trim()) {
      errors.push('Descrição da regra é obrigatória');
    }

    if (!ruleData.trigger_type) {
      errors.push('Tipo de trigger é obrigatório');
    }

    if (ruleData.trigger_type === 'scheduled' && !ruleData.trigger_conditions.schedule) {
      errors.push('Agendamento é obrigatório para triggers agendados');
    }

    if (ruleData.actions.length === 0) {
      errors.push('Pelo menos uma ação deve ser configurada');
    }

    // Validate actions
    ruleData.actions.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Ação ${index + 1}: Tipo de ação é obrigatório`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (!validateRule()) {
      toast({
        title: "Validação Failed",
        description: "Corrija os erros antes de salvar a regra",
        variant: "destructive"
      });
      return;
    }

    if (onRuleCreate) {
      onRuleCreate(ruleData);
    }
  };

  const updateRuleData = (updates: Partial<RuleData>) => {
    setRuleData(prev => ({ ...prev, ...updates }));
    setValidationErrors([]); // Clear validation errors when data changes
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Nome da Regra</Label>
              <Input
                id="rule-name"
                value={ruleData.name}
                onChange={(e) => updateRuleData({ name: e.target.value })}
                placeholder="Ex: Processamento Contábil Diário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Descrição</Label>
              <Textarea
                id="rule-description"
                value={ruleData.description}
                onChange={(e) => updateRuleData({ description: e.target.value })}
                placeholder="Descreva o que esta regra fará..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Regra</Label>
              <div className="flex gap-2">
                <Badge 
                  variant={ruleData.type === 'workflow' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => updateRuleData({ type: 'workflow' })}
                >
                  Workflow
                </Badge>
                <Badge 
                  variant={ruleData.type === 'scheduled' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => updateRuleData({ type: 'scheduled' })}
                >
                  Agendado
                </Badge>
                <Badge 
                  variant={ruleData.type === 'reactive' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => updateRuleData({ type: 'reactive' })}
                >
                  Reativo
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'trigger':
        return (
          <TriggerBuilder
            triggerType={ruleData.trigger_type}
            triggerConditions={ruleData.trigger_conditions}
            onChange={(trigger_type, trigger_conditions) => 
              updateRuleData({ trigger_type, trigger_conditions })
            }
          />
        );

      case 'actions':
        return (
          <ActionBuilder
            actions={ruleData.actions}
            onChange={(actions) => updateRuleData({ actions })}
          />
        );

      case 'preview':
        return (
          <RulePreview rule={ruleData} />
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 'basic', title: 'Informações Básicas', description: 'Nome e descrição da regra' },
    { id: 'trigger', title: 'Configurar Trigger', description: 'Como a regra será ativada' },
    { id: 'actions', title: 'Definir Ações', description: 'O que a regra executará' },
    { id: 'preview', title: 'Revisão', description: 'Revisar e salvar a regra' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {initialRule ? 'Editar Regra de Automação' : 'Nova Regra de Automação'}
        </CardTitle>
        <CardDescription>
          Configure uma nova regra de automação para otimizar seus processos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {index + 1}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-px mx-4
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="border-destructive">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-destructive">Erros de Validação</h4>
                  <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Visualizar'} Preview
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(steps[currentStepIndex - 1].id as any)}
              >
                Anterior
              </Button>
            )}
            
            {currentStepIndex < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(steps[currentStepIndex + 1].id as any)}
              >
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Regra
              </Button>
            )}
          </div>
        </div>

        {/* Preview Modal/Panel */}
        {showPreview && (
          <Card className="mt-4 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Preview da Regra</CardTitle>
            </CardHeader>
            <CardContent>
              <RulePreview rule={ruleData} />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};