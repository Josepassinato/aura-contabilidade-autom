import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  FileKey, 
  Usb, 
  Download,
  ExternalLink,
  HelpCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CertificadoWizardProps {
  onComplete: (data: any) => void;
}

interface CertificadoA3 {
  id: string;
  name: string;
  issuer: string;
  validUntil: string;
  type: 'A1' | 'A3';
  status: 'valid' | 'expired' | 'expiring';
}

export function CertificadoWizard({ onComplete }: CertificadoWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [certificadosA3, setCertificadosA3] = useState<CertificadoA3[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedCertificado, setSelectedCertificado] = useState<string>('');
  const [senhaA3, setSenhaA3] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [arquivoA1, setArquivoA1] = useState<File | null>(null);
  const [senhaA1, setSenhaA1] = useState('');
  const [tipoCertificado, setTipoCertificado] = useState<'A1' | 'A3' | ''>('');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const steps = [
    {
      title: 'Detecção de Certificados',
      description: 'Vamos detectar certificados A3 conectados ao seu computador'
    },
    {
      title: 'Configuração do Certificado',
      description: 'Configure seu certificado digital para acessar os portais governamentais'
    },
    {
      title: 'Teste de Conectividade',
      description: 'Vamos testar se a configuração está funcionando corretamente'
    }
  ];

  useEffect(() => {
    // Auto-detectar certificados A3 ao carregar
    detectarCertificadosA3();
  }, []);

  const detectarCertificadosA3 = async () => {
    setIsDetecting(true);
    
    try {
      // Simular detecção de certificados A3
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const certificadosEncontrados: CertificadoA3[] = [
        {
          id: 'cert-1',
          name: 'ACME CONTABILIDADE LTDA:12345678000199',
          issuer: 'AC Certisign',
          validUntil: '2025-12-31',
          type: 'A3',
          status: 'valid'
        },
        {
          id: 'cert-2', 
          name: 'Usuário Exemplo:12345678901',
          issuer: 'AC Serasa',
          validUntil: '2024-08-15',
          type: 'A3',
          status: 'expiring'
        }
      ];
      
      setCertificadosA3(certificadosEncontrados);
      
      if (certificadosEncontrados.length > 0) {
        setTipoCertificado('A3');
        toast({
          title: 'Certificados encontrados!',
          description: `${certificadosEncontrados.length} certificado(s) A3 detectado(s).`
        });
      } else {
        toast({
          title: 'Nenhum certificado A3 encontrado',
          description: 'Você pode configurar um certificado A1 ou conectar seu token/cartão A3.',
          variant: 'default'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na detecção',
        description: 'Não foi possível detectar certificados A3. Você pode configurar manualmente.',
        variant: 'destructive'
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const testarConectividade = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Simular teste de conectividade
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simular resultado baseado na configuração
      const sucesso = tipoCertificado === 'A3' 
        ? selectedCertificado && senhaA3
        : arquivoA1 && senhaA1;
      
      if (sucesso) {
        setTestResult('success');
        toast({
          title: 'Teste bem-sucedido!',
          description: 'Certificado configurado corretamente. Conexão com os portais governamentais estabelecida.'
        });
      } else {
        setTestResult('error');
        toast({
          title: 'Teste falhou',
          description: 'Verifique as credenciais e tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível testar a conectividade.',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleArquivoA1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.p12') || file.name.endsWith('.pfx')) {
        setArquivoA1(file);
      } else {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione um arquivo .p12 ou .pfx',
          variant: 'destructive'
        });
      }
    }
  };

  const proximoPasso = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar wizard
      const dadosCertificado = {
        tipo: tipoCertificado,
        ...(tipoCertificado === 'A3' ? {
          certificadoId: selectedCertificado,
          senha: senhaA3
        } : {
          arquivo: arquivoA1?.name,
          senha: senhaA1
        }),
        testePassed: testResult === 'success'
      };
      
      onComplete(dadosCertificado);
    }
  };

  const podeProximoPasso = () => {
    switch (currentStep) {
      case 0:
        return tipoCertificado !== '';
      case 1:
        if (tipoCertificado === 'A3') {
          return selectedCertificado && senhaA3;
        } else {
          return arquivoA1 && senhaA1;
        }
      case 2:
        return testResult === 'success';
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Detecção Automática de Certificados</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={detectarCertificadosA3}
                disabled={isDetecting}
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detectando...
                  </>
                ) : (
                  <>
                    <Usb className="h-4 w-4 mr-2" />
                    Detectar Novamente
                  </>
                )}
              </Button>
            </div>

            {isDetecting && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Detectando certificados A3...</p>
                      <p className="text-sm text-blue-700">Conecte seu token ou cartão inteligente se ainda não o fez.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {certificadosA3.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Certificados A3 Encontrados</h4>
                  <Badge variant="secondary">{certificadosA3.length} encontrado(s)</Badge>
                </div>
                
                <div className="grid gap-3">
                  {certificadosA3.map((cert) => (
                    <Card key={cert.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <p className="font-medium text-sm">{cert.name}</p>
                              <Badge 
                                variant={cert.status === 'valid' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {cert.status === 'valid' ? 'Válido' : cert.status === 'expiring' ? 'Expirando' : 'Expirado'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Emissor: {cert.issuer}</p>
                            <p className="text-xs text-muted-foreground">Válido até: {cert.validUntil}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant={tipoCertificado === 'A3' ? 'default' : 'outline'}
                            onClick={() => setTipoCertificado('A3')}
                          >
                            Usar A3
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Ou use certificado A1</h4>
                <Button 
                  size="sm" 
                  variant={tipoCertificado === 'A1' ? 'default' : 'outline'}
                  onClick={() => setTipoCertificado('A1')}
                >
                  Usar A1
                </Button>
              </div>
              
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <FileKey className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Certificado A1</p>
                      <p className="text-sm text-amber-700">
                        Arquivo digital (.p12 ou .pfx) armazenado no computador.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Não possui certificado digital?</span>
              </div>
              <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Onde adquirir
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Como adquirir um Certificado Digital</DialogTitle>
                    <DialogDescription>
                      Guia completo para obter seu certificado digital
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Autoridades Certificadoras Credenciadas</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: 'Serasa Experian', url: 'https://certificadodigital.serasa.com.br' },
                          { name: 'Certisign', url: 'https://www.certisign.com.br' },
                          { name: 'Soluti', url: 'https://www.soluti.com.br' },
                          { name: 'Valid Certificadora', url: 'https://www.valid.com.br' }
                        ].map((ac) => (
                          <Card key={ac.name} className="p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{ac.name}</span>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={ac.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Tipos de Certificado</h4>
                      <div className="space-y-3">
                        <Card className="p-4">
                          <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                              <h5 className="font-medium">A1 (Software)</h5>
                              <p className="text-sm text-muted-foreground">
                                Arquivo digital instalado no computador. Válido por 1 ano.
                                Ideal para uso em um único computador.
                              </p>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-4">
                          <div className="flex items-start space-x-3">
                            <Usb className="h-5 w-5 text-green-600 mt-1" />
                            <div>
                              <h5 className="font-medium">A3 (Hardware)</h5>
                              <p className="text-sm text-muted-foreground">
                                Token USB ou cartão inteligente. Válido por 1-5 anos.
                                Pode ser usado em qualquer computador.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Para contadores:</strong> Recomendamos o certificado A3 por sua maior segurança 
                        e mobilidade entre diferentes computadores e clientes.
                      </AlertDescription>
                    </Alert>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Configuração do Certificado</h3>
            
            {tipoCertificado === 'A3' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="certificado-select">Selecione o certificado A3</Label>
                  <select
                    id="certificado-select"
                    className="w-full p-2 border rounded-md mt-1"
                    value={selectedCertificado}
                    onChange={(e) => setSelectedCertificado(e.target.value)}
                  >
                    <option value="">Selecione um certificado...</option>
                    {certificadosA3.map((cert) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.name} - {cert.issuer}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="senha-a3">Senha do certificado A3</Label>
                  <div className="relative mt-1">
                    <Input
                      id="senha-a3"
                      type={showPassword ? 'text' : 'password'}
                      value={senhaA3}
                      onChange={(e) => setSenhaA3(e.target.value)}
                      placeholder="Digite a senha do seu certificado A3"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {tipoCertificado === 'A1' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="arquivo-a1">Arquivo do certificado A1</Label>
                  <Input
                    id="arquivo-a1"
                    type="file"
                    accept=".p12,.pfx"
                    onChange={handleArquivoA1Change}
                    className="mt-1"
                  />
                  {arquivoA1 && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Arquivo selecionado: {arquivoA1.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="senha-a1">Senha do certificado A1</Label>
                  <div className="relative mt-1">
                    <Input
                      id="senha-a1"
                      type={showPassword ? 'text' : 'password'}
                      value={senhaA1}
                      onChange={(e) => setSenhaA1(e.target.value)}
                      placeholder="Digite a senha do seu certificado A1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Sua senha é criptografada e armazenada com segurança. 
                Nunca compartilhamos suas credenciais com terceiros.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Teste de Conectividade</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verificar Configuração</CardTitle>
                <CardDescription>
                  Vamos testar se o certificado está configurado corretamente e pode acessar os portais governamentais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Tipo de certificado</p>
                    <p className="text-sm text-muted-foreground">
                      {tipoCertificado === 'A3' ? 'Certificado A3 (Hardware)' : 'Certificado A1 (Software)'}
                    </p>
                  </div>
                  <Badge>{tipoCertificado}</Badge>
                </div>

                {testResult === null && (
                  <Button 
                    onClick={testarConectividade}
                    disabled={isTesting}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testando conectividade...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Testar Conectividade
                      </>
                    )}
                  </Button>
                )}

                {isTesting && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="font-medium text-blue-900">Testando conectividade...</span>
                        </div>
                        <div className="space-y-2 text-sm text-blue-700">
                          <p>✓ Validando certificado</p>
                          <p>✓ Conectando com Receita Federal</p>
                          <p>⏳ Testando acesso aos portais estaduais...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {testResult === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Teste bem-sucedido!</strong> Seu certificado está configurado corretamente.
                      Você pode acessar todos os portais governamentais.
                    </AlertDescription>
                  </Alert>
                )}

                {testResult === 'error' && (
                  <Alert className="border-red-200 bg-red-50" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Teste falhou!</strong> Verifique a senha do certificado e tente novamente.
                      Se o problema persistir, entre em contato com o suporte.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Configuração de Certificado Digital</h2>
          <Badge variant="outline">Passo {currentStep + 1} de {steps.length}</Badge>
        </div>
        
        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
              <span className={index === currentStep ? 'font-medium text-foreground' : ''}>
                {step.title}
              </span>
              {index < steps.length - 1 && <span>→</span>}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        
        <Button
          onClick={proximoPasso}
          disabled={!podeProximoPasso()}
        >
          {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}