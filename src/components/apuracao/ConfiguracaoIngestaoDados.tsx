
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileUp, 
  RefreshCcw, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Play,
  Database
} from "lucide-react";
import { FontesDadosAutomaticas, FonteDadosConfig } from './FontesDadosAutomaticas';
import { 
  salvarFonteDadosConfig, 
  obterTodasFontesDados,
  testarConexaoFonteDados,
  iniciarIngestaoAutomatica
} from '@/services/apuracao/fontesDadosService';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ConfiguracaoIngestaoDadosProps {
  onComplete?: () => void;
}

export function ConfiguracaoIngestaoDados({ onComplete }: ConfiguracaoIngestaoDadosProps) {
  const [fontesConfiguradas, setFontesConfiguradas] = useState<FonteDadosConfig[]>(obterTodasFontesDados());
  const [showConfig, setShowConfig] = useState(false);
  const [fonteEmTeste, setFonteEmTeste] = useState<string | null>(null);
  const [fonteEmIngestao, setFonteEmIngestao] = useState<string | null>(null);

  // Salvar uma configuração de fonte
  const handleSaveConfig = (config: FonteDadosConfig) => {
    salvarFonteDadosConfig(config);
    setFontesConfiguradas(obterTodasFontesDados());
    setShowConfig(false);
  };

  // Testar conexão com a fonte
  const handleTestConnection = async (tipo: string) => {
    const config = fontesConfiguradas.find(f => f.tipo === tipo);
    if (!config) return;
    
    setFonteEmTeste(tipo);
    try {
      await testarConexaoFonteDados(config);
    } finally {
      setFonteEmTeste(null);
    }
  };

  // Iniciar ingestão manual de dados
  const handleStartIngestion = async (tipo: string) => {
    setFonteEmIngestao(tipo);
    try {
      await iniciarIngestaoAutomatica(tipo);
    } finally {
      setFonteEmIngestao(null);
    }
  };

  // Obter o nome amigável do tipo de fonte
  const getFriendlyName = (tipo: string): string => {
    switch (tipo) {
      case 'ocr': return 'OCR Documentos';
      case 'openbanking': return 'Open Banking';
      case 'api_fiscal': return 'API Fiscal';
      case 'erp': return 'Integração ERP';
      default: return tipo.toUpperCase();
    }
  };

  // Obter a cor do status da fonte
  const getStatusColor = (config: FonteDadosConfig): string => {
    if (Object.keys(config.credenciais || {}).length === 0) {
      return 'bg-amber-500';
    }
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {showConfig ? (
        <FontesDadosAutomaticas onSave={handleSaveConfig} />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fontes de Dados Automáticas</CardTitle>
              <CardDescription>
                Configure integrações automáticas para ingestão contínua de dados
              </CardDescription>
            </div>
            <Button onClick={() => setShowConfig(true)}>
              Adicionar Fonte
            </Button>
          </CardHeader>
          
          <CardContent>
            {fontesConfiguradas.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">Nenhuma fonte configurada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure fontes de dados automáticas para iniciar ingestão contínua
                </p>
                <Button variant="outline" onClick={() => setShowConfig(true)}>
                  Configurar Primeira Fonte
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {fontesConfiguradas.map((fonte) => (
                  <AccordionItem key={fonte.tipo} value={fonte.tipo}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Badge className={getStatusColor(fonte)} variant="outline">
                          {getFriendlyName(fonte.tipo)}
                        </Badge>
                        <span className="text-sm font-normal text-muted-foreground">
                          {fonte.agendamento === 'diario' ? 'Atualização diária' : 
                           fonte.agendamento === 'semanal' ? 'Atualização semanal' : 
                           fonte.agendamento === 'mensal' ? 'Atualização mensal' : 
                           'Sob demanda'}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-2 space-y-4 border rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Tipo:</span> {getFriendlyName(fonte.tipo)}
                          </div>
                          <div>
                            <span className="font-medium">Agendamento:</span> {fonte.agendamento}
                          </div>
                          <div>
                            <span className="font-medium">Integração contínua:</span> {fonte.integracao_continua ? 'Sim' : 'Não'}
                          </div>
                          <div>
                            <span className="font-medium">Processamento automático:</span> {fonte.processamento_automatico ? 'Sim' : 'Não'}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline"
                            size="sm"
                            disabled={fonteEmTeste === fonte.tipo}
                            onClick={() => handleTestConnection(fonte.tipo)}
                          >
                            {fonteEmTeste === fonte.tipo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Testando...
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Testar Conexão
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            disabled={fonteEmIngestao === fonte.tipo}
                            onClick={() => handleStartIngestion(fonte.tipo)}
                          >
                            {fonteEmIngestao === fonte.tipo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar Ingestão
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
          
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => toast({
              title: "Dica",
              description: "Configure ao menos uma fonte de dados para ingestão automática de documentos fiscais e bancários."
            })}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Ajuda
            </Button>
            
            <Button onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Concluir Configuração
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
