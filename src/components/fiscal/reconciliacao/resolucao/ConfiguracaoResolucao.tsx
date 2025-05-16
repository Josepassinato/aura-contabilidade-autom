
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { ConfiguracaoResolucao as ConfigResolucao } from "@/services/fiscal/reconciliacao/resolucaoAutonoma";

interface ConfiguracaoResolucaoProps {
  configuracao: ConfigResolucao;
  setConfiguracao: React.Dispatch<React.SetStateAction<ConfigResolucao>>;
  configPadraoResolucao: ConfigResolucao;
  onClose: () => void;
}

export function ConfiguracaoResolucao({
  configuracao,
  setConfiguracao,
  configPadraoResolucao,
  onClose
}: ConfiguracaoResolucaoProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Configurações de Resolução Autônoma</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="resolverDuplicados">Resolver lançamentos duplicados</Label>
          <Switch 
            id="resolverDuplicados"
            checked={configuracao.resolverLancamentosDuplicados}
            onCheckedChange={(checked) => setConfiguracao({
              ...configuracao,
              resolverLancamentosDuplicados: checked
            })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="corrigirDivergencias">Corrigir divergências de valor</Label>
          <Switch 
            id="corrigirDivergencias"
            checked={configuracao.corrigirDivergenciasValor}
            onCheckedChange={(checked) => setConfiguracao({
              ...configuracao,
              corrigirDivergenciasValor: checked
            })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="criarLancamentos">Criar lançamentos para transações não conciliadas</Label>
          <Switch 
            id="criarLancamentos"
            checked={configuracao.criarLancamentosParaTransacoesNaoConciliadas}
            onCheckedChange={(checked) => setConfiguracao({
              ...configuracao,
              criarLancamentosParaTransacoesNaoConciliadas: checked
            })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="ignorarInternas">Ignorar transações internas</Label>
          <Switch 
            id="ignorarInternas"
            checked={configuracao.ignorarTransacoesInternas}
            onCheckedChange={(checked) => setConfiguracao({
              ...configuracao,
              ignorarTransacoesInternas: checked
            })}
          />
        </div>
        
        <Separator className="my-2" />
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="tolerancia">Tolerância de divergência (%)</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Slider 
                id="tolerancia"
                min={0} 
                max={10} 
                step={0.5}
                value={[configuracao.toleranciaDivergencia * 100]}
                onValueChange={(value) => setConfiguracao({
                  ...configuracao,
                  toleranciaDivergencia: value[0] / 100
                })}
                className="flex-1"
              />
              <span className="w-12 text-center">{(configuracao.toleranciaDivergencia * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confiancaMinima">Confiança mínima para resolução</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Slider 
                id="confiancaMinima"
                min={50} 
                max={100} 
                step={1}
                value={[configuracao.minimumConfidenceToResolve * 100]}
                onValueChange={(value) => setConfiguracao({
                  ...configuracao,
                  minimumConfidenceToResolve: value[0] / 100
                })}
                className="flex-1"
              />
              <span className="w-12 text-center">{Math.round(configuracao.minimumConfidenceToResolve * 100)}%</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="diasRetroativos">Máximo de dias retroativos</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="diasRetroativos"
                type="number"
                min={1}
                max={365}
                value={configuracao.maxDiasRetroativos}
                onChange={(e) => setConfiguracao({
                  ...configuracao,
                  maxDiasRetroativos: parseInt(e.target.value) || 90
                })}
                className="w-20"
              />
              <Label className="flex-1">dias</Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setConfiguracao({...configPadraoResolucao})}
          >
            Restaurar Padrões
          </Button>
          
          <Button 
            size="sm"
            onClick={onClose}
          >
            Aplicar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
