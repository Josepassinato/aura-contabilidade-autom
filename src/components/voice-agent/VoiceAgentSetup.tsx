import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Shield, Mic, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { authStorage } from '@/utils/secureStorage';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface ClientData {
  id: string;
  name: string;
  accounting_firm_name: string;
  logo_url?: string;
  theme_colors?: {
    primary: string;
    secondary: string;
  };
}

const VoiceAgentSetup: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const steps: SetupStep[] = [
    {
      id: 'scan',
      title: 'Escaneie o QR Code',
      description: 'Use a câmera para escanear o código fornecido pela sua contabilidade',
      icon: QrCode,
      completed: !!clientData
    },
    {
      id: 'install',
      title: 'Instalar App',
      description: 'Adicione o app à tela inicial do seu celular',
      icon: Smartphone,
      completed: false
    },
    {
      id: 'security',
      title: 'Configurar Segurança',
      description: 'Configure autenticação biométrica para maior segurança',
      icon: Shield,
      completed: false
    },
    {
      id: 'voice',
      title: 'Testar Voz',
      description: 'Calibre o microfone e teste o agente de voz',
      icon: Mic,
      completed: false
    }
  ];

  useEffect(() => {
    // Detect install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      updateStepCompletion('install', true);
    }
  }, []);

  const updateStepCompletion = (stepId: string, completed: boolean) => {
    // In a real app, this would update local storage or state
    console.log(`Step ${stepId} completed: ${completed}`);
  };

  const handleQRScan = async (qrData: string) => {
    try {
      // Parse QR code data with proper error handling
      let data;
      try {
        data = JSON.parse(atob(qrData));
      } catch (parseError) {
        throw new Error('QR Code inválido ou corrompido');
      }
      
      // Validate with backend
      const { data: client, error } = await supabase
        .from('accounting_clients')
        .select(`
          id, name,
          accounting_firms(name)
        `)
        .eq('id', data.clientId)
        .single();

      if (error) throw error;

      setClientData({
        id: client.id,
        name: client.name,
        accounting_firm_name: client.accounting_firms?.name || 'Contabilidade',
        logo_url: data.logoUrl,
        theme_colors: data.colors
      });

      // Store secure credentials using encrypted storage
      authStorage.setClientId(client.id);
      authStorage.setClientData({
        id: client.id,
        name: client.name,
        accounting_firm_name: client.accounting_firms?.name || 'Contabilidade'
      });

      setCurrentStep(1);
      toast({
        title: "QR Code válido!",
        description: `Conectado com ${client.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro no QR Code",
        description: "Código inválido ou expirado. Solicite um novo à sua contabilidade.",
        variant: "destructive",
      });
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        updateStepCompletion('install', true);
        setCurrentStep(2);
        toast({
          title: "App instalado!",
          description: "Agora você pode acessar direto da tela inicial",
        });
      }
    } else {
      // Manual instructions for iOS or other browsers
      toast({
        title: "Adicionar à tela inicial",
        description: "Use o menu do navegador para 'Adicionar à tela inicial'",
      });
    }
  };

  const handleBiometricSetup = async () => {
    try {
      if ('credentials' in navigator) {
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "ContaFlix" },
            user: { 
              id: new TextEncoder().encode(clientData?.id || ''),
              name: clientData?.name || '',
              displayName: clientData?.name || ''
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "direct"
          }
        });

        authStorage.setBiometricId(credential?.id || '');
        updateStepCompletion('security', true);
        setCurrentStep(3);
        
        toast({
          title: "Segurança configurada!",
          description: "Autenticação biométrica ativada",
        });
      }
    } catch (error) {
      toast({
        title: "Biometria não disponível",
        description: "Continuando com autenticação por PIN",
        variant: "destructive",
      });
      setCurrentStep(3);
    }
  };

  const handleVoiceTest = async () => {
    try {
      // Import browser capabilities
      const { detectBrowserCapabilities, getOptimalAudioConstraints } = await import('@/utils/mediaRecorderUtils');
      
      // Detect browser capabilities
      const capabilities = detectBrowserCapabilities();
      
      if (!capabilities.hasGetUserMedia) {
        throw new Error('Seu navegador não suporta gravação de áudio');
      }
      
      // Show browser-specific warnings
      if (capabilities.isSafari || capabilities.isIOS) {
        toast({
          title: "Navegador Safari detectado",
          description: "Para melhor experiência, recomendamos usar Chrome",
          variant: "default",
        });
      }
      
      if (!capabilities.hasMediaRecorder) {
        toast({
          title: "MediaRecorder não suportado",
          description: "Usaremos modo de compatibilidade",
          variant: "default",
        });
      }
      
      // Get optimal constraints for this browser
      const constraints = getOptimalAudioConstraints(capabilities);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Test microphone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      // Test for actual audio input
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      // Check if we're getting audio data
      const hasAudio = dataArray.some(value => value > 0);
      
      // Stop stream after test
      stream.getTracks().forEach(track => track.stop());
      await audioContext.close();
      
      if (!hasAudio) {
        throw new Error('Nenhum sinal de áudio detectado');
      }
      
      updateStepCompletion('voice', true);
      setSetupComplete(true);
      
      toast({
        title: "Configuração concluída!",
        description: `Agente de voz configurado com sucesso. Compatibilidade: ${capabilities.supportedMimeTypes.length > 0 ? 'Ótima' : 'Básica'}`,
      });
    } catch (error) {
      console.error('Voice test failed:', error);
      
      let errorMessage = "Verifique as permissões de áudio";
      
      if (error instanceof Error) {
        if (error.message.includes('não suporta')) {
          errorMessage = "Navegador não suporta gravação de áudio. Tente Chrome ou Firefox";
        } else if (error.message.includes('Permission denied')) {
          errorMessage = "Permissão de microfone negada. Habilite nas configurações do navegador";
        } else if (error.message.includes('NotFoundError')) {
          errorMessage = "Nenhum microfone encontrado. Conecte um microfone";
        } else if (error.message.includes('Nenhum sinal')) {
          errorMessage = "Microfone conectado mas sem áudio. Verifique se não está mudo";
        }
      }
      
      toast({
        title: "Erro no teste de voz",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'scan':
        return (
          <div className="text-center space-y-4">
            <QrCode className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground">
              Solicite o QR Code à sua contabilidade e escaneie com a câmera
            </p>
            <input 
              type="text" 
              placeholder="Ou cole o código aqui"
              className="w-full p-2 border rounded"
              onChange={(e) => e.target.value && handleQRScan(e.target.value)}
            />
          </div>
        );
        
      case 'install':
        return (
          <div className="text-center space-y-4">
            <Smartphone className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground">
              Instale o app para acesso rápido da tela inicial
            </p>
            <Button onClick={handleInstallApp} className="w-full">
              Instalar App
            </Button>
          </div>
        );
        
      case 'security':
        return (
          <div className="text-center space-y-4">
            <Shield className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground">
              Configure a autenticação biométrica para maior segurança
            </p>
            <Button onClick={handleBiometricSetup} className="w-full">
              Configurar Biometria
            </Button>
          </div>
        );
        
      case 'voice':
        return (
          <div className="text-center space-y-4">
            <Mic className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground">
              Teste o microfone e calibre o agente de voz
            </p>
            <Button onClick={handleVoiceTest} className="w-full">
              Testar Microfone
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <CardTitle>Configuração Concluída!</CardTitle>
            <CardDescription>
              Seu agente de voz está pronto para uso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientData && (
              <div className="text-center space-y-2 mb-4">
                <p className="font-medium">{clientData.name}</p>
                <Badge variant="secondary">{clientData.accounting_firm_name}</Badge>
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={() => {
                // Generate a temporary access token for seamless transition
                const tempToken = btoa(JSON.stringify({
                  clientId: clientData?.id,
                  timestamp: Date.now(),
                  setup: true
                }));
                // Use replace instead of href to avoid navigation issues
                window.location.replace(`/voice-agent?token=${tempToken}`);
              }}
            >
              Começar a Usar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Configuração do Agente de Voz</CardTitle>
          <CardDescription className="text-center">
            Vamos configurar seu assistente pessoal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="flex justify-between mb-6">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : index === currentStep
                    ? 'border-primary'
                    : 'border-muted'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
            
            {renderCurrentStep()}
          </div>

          {/* Client Info */}
          {clientData && (
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="text-center space-y-2">
                <p className="font-medium">{clientData.name}</p>
                <Badge variant="outline">{clientData.accounting_firm_name}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAgentSetup;