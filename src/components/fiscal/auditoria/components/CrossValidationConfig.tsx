
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings2, RefreshCcw, Save, Database } from "lucide-react";
import { 
  CrossValidationConfig, 
  configureCrossValidation, 
  getCrossValidationConfig 
} from "@/services/fiscal/validation/crossValidationService";
import { toast } from "@/hooks/use-toast";
import { obterTodasFontesDados } from "@/services/apuracao/fontesDadosService";
import { FonteDadosConfig } from "@/components/apuracao/FontesDadosAutomaticas";

interface CrossValidationConfigProps {
  onConfigChange?: (config: CrossValidationConfig) => void;
}

export function CrossValidationConfigComponent({ onConfigChange }: CrossValidationConfigProps) {
  const [config, setConfig] = useState<CrossValidationConfig>(getCrossValidationConfig());
  const [availableSources, setAvailableSources] = useState<FonteDadosConfig[]>([]);
  
  useEffect(() => {
    // Get available data sources
    const sources = obterTodasFontesDados();
    setAvailableSources(sources);
  }, []);
  
  const handleEnableSourceToggle = (sourceType: string) => {
    setConfig(prev => {
      const enabledSources = prev.enabledSources.includes(sourceType)
        ? prev.enabledSources.filter(s => s !== sourceType)
        : [...prev.enabledSources, sourceType];
      
      return { ...prev, enabledSources };
    });
  };
  
  const handleSaveConfig = () => {
    const updatedConfig = configureCrossValidation(config);
    
    if (onConfigChange) {
      onConfigChange(updatedConfig);
    }
    
    toast({
      title: "Configuração salva",
      description: "Configuração de validação cruzada atualizada com sucesso",
    });
  };
  
  // Helper function to get friendly name for source types
  const getSourceName = (sourceType: string): string => {
    switch (sourceType) {
      case 'ocr': return 'OCR Documentos';
      case 'api_fiscal': return 'API Fiscal';
      case 'erp': return 'Sistema ERP';
      case 'openbanking': return 'Open Banking';
      default: return sourceType.toUpperCase();
    }
  };

  const handleThresholdChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, matchThreshold: value[0] / 100 }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Configuração de Validação Cruzada</CardTitle>
            <CardDescription>
              Configure a validação cruzada entre diferentes fontes de dados
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sources Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Fontes de Dados para Validação</h3>
            <Badge className="bg-primary/10 text-primary border-primary">
              {config.enabledSources.length} selecionadas
            </Badge>
          </div>
          
          {availableSources.length === 0 ? (
            <div className="flex items-center justify-center p-4 border rounded-md bg-muted/20">
              <Database className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Nenhuma fonte de dados configurada</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSources.map((source) => (
                <div
                  key={source.tipo}
                  className="flex items-center space-x-2 p-2 border rounded-md"
                >
                  <Checkbox
                    id={`source-${source.tipo}`}
                    checked={config.enabledSources.includes(source.tipo)}
                    onCheckedChange={() => handleEnableSourceToggle(source.tipo)}
                  />
                  <Label
                    htmlFor={`source-${source.tipo}`}
                    className="flex-1 cursor-pointer"
                  >
                    {getSourceName(source.tipo)}
                  </Label>
                </div>
              ))}
            </div>
          )}
          
          {availableSources.length > 0 && config.enabledSources.length < 2 && (
            <p className="text-xs text-amber-600">
              Selecione pelo menos duas fontes de dados para validação cruzada
            </p>
          )}
        </div>
        
        {/* Match Threshold */}
        <div className="space-y-3">
          <div>
            <Label className="text-base font-medium">
              Limiar de Correspondência ({Math.round(config.matchThreshold * 100)}%)
            </Label>
            <p className="text-sm text-muted-foreground">
              Percentual mínimo de correspondência para validação bem-sucedida
            </p>
          </div>
          
          <Slider
            value={[config.matchThreshold * 100]}
            min={70}
            max={100}
            step={1}
            onValueChange={handleThresholdChange}
            className="py-4"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>70% (Básico)</span>
            <span>85% (Padrão)</span>
            <span>100% (Rigoroso)</span>
          </div>
        </div>
        
        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Opções de Validação</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="validate-automatically"
              checked={config.validateAutomatically}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, validateAutomatically: !!checked }))
              }
            />
            <Label htmlFor="validate-automatically">
              Validar dados automaticamente ao importar
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-discrepancy"
              checked={config.notifyOnDiscrepancy}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, notifyOnDiscrepancy: !!checked }))
              }
            />
            <Label htmlFor="notify-discrepancy">
              Notificar quando discrepâncias forem detectadas
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="store-history"
              checked={config.storeValidationHistory}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, storeValidationHistory: !!checked }))
              }
            />
            <Label htmlFor="store-history">
              Armazenar histórico de validações
            </Label>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setConfig(getCrossValidationConfig())}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Resetar
        </Button>
        <Button onClick={handleSaveConfig}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configuração
        </Button>
      </CardFooter>
    </Card>
  );
}

// Missing Badge component from the imports
import { Badge } from "@/components/ui/badge";
