import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Clock,
  Calendar,
  User,
  Bot,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClientContext {
  id: string;
  name: string;
  cnpj: string;
  regime: string;
  permissions: string[];
  recentObligations: any[];
  accountantName: string;
}

interface VoiceAgentInterfaceProps {
  token: string;
}

export function VoiceAgentInterface({ token }: VoiceAgentInterfaceProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [context, setContext] = useState<ClientContext | null>(null);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadClientContext();
    initializeAudio();
  }, [token]);

  const loadClientContext = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('voice-agent', {
        body: { action: 'get_context', token }
      });

      if (error) throw error;

      if (data.success) {
        setContext(data.context);
        // Adicionar mensagem de boas-vindas
        setConversation([{
          type: 'assistant',
          content: `Olá! Sou seu assistente fiscal da ${data.context.name}. Como posso ajudá-lo hoje?`,
          timestamp: new Date()
        }]);

        // Auto-reproduzir mensagem de boas-vindas
        if (showOnboarding) {
          await playWelcomeMessage(data.context.name);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível verificar suas credenciais.",
        variant: "destructive",
      });
    }
  };

  const initializeAudio = async () => {
    try {
      audioContextRef.current = new AudioContext();
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
      toast({
        title: "Permissão de microfone",
        description: "É necessário permitir acesso ao microfone para usar o assistente de voz.",
        variant: "destructive",
      });
    }
  };

  const playWelcomeMessage = async (companyName: string) => {
    const welcomeText = `Olá! Sou seu assistente fiscal da ${companyName}. Posso ajudá-lo com consultas sobre impostos, obrigações e muito mais. Para começar, clique no botão do microfone e faça sua pergunta.`;
    await playAudioResponse(welcomeText);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processRecordedAudio();
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast({
        title: "Erro de gravação",
        description: "Não foi possível iniciar a gravação de áudio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processRecordedAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioBase64 = await blobToBase64(audioBlob);

      const { data, error } = await supabase.functions.invoke('voice-agent', {
        body: { 
          action: 'process_audio', 
          token, 
          audioData: audioBase64.split(',')[1] // Remove data:audio/webm;base64, prefix
        }
      });

      if (error) throw error;

      if (data.success) {
        // Adicionar pergunta do usuário
        setConversation(prev => [...prev, {
          type: 'user',
          content: data.transcription,
          timestamp: new Date()
        }]);

        // Adicionar resposta do assistente
        setConversation(prev => [...prev, {
          type: 'assistant',
          content: data.textResponse,
          timestamp: new Date()
        }]);

        // Reproduzir resposta em áudio
        await playAudioFromBase64(data.audioResponse);
      }

    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      toast({
        title: "Erro de processamento",
        description: "Não foi possível processar sua mensagem de voz.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('voice-agent', {
        body: { action: 'process_text', token, message }
      });

      if (error) throw error;

      if (data.success) {
        // Adicionar pergunta do usuário
        setConversation(prev => [...prev, {
          type: 'user',
          content: message,
          timestamp: new Date()
        }]);

        // Adicionar resposta do assistente
        setConversation(prev => [...prev, {
          type: 'assistant',
          content: data.textResponse,
          timestamp: new Date()
        }]);

        // Reproduzir resposta em áudio
        await playAudioFromBase64(data.audioResponse);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro de processamento",
        description: "Não foi possível processar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioFromBase64 = async (audioBase64: string) => {
    try {
      setIsSpeaking(true);
      
      const audioData = atob(audioBase64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setIsSpeaking(false);
    }
  };

  const playAudioResponse = async (text: string) => {
    // Gerar áudio para texto usando TTS
    try {
      const { data, error } = await supabase.functions.invoke('voice-agent', {
        body: { action: 'generate_audio', text }
      });

      if (error) throw error;
      if (data.audioContent) {
        await playAudioFromBase64(data.audioContent);
      }
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const onboardingSteps = [
    {
      title: "Bem-vindo ao seu Assistente Fiscal!",
      content: "Sou seu assistente pessoal para consultas fiscais e contábeis. Posso ajudá-lo com informações sobre impostos, obrigações e muito mais."
    },
    {
      title: "Como funciona?",
      content: "Você pode falar comigo clicando no botão do microfone ou digitando suas perguntas. Responderei com informações específicas da sua empresa."
    },
    {
      title: "Vamos começar!",
      content: "Teste seu microfone e faça sua primeira pergunta. Por exemplo: 'Quais são minhas próximas obrigações?' ou 'Quando vence meu DAS?'"
    }
  ];

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {onboardingSteps[onboardingStep].title}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {onboardingSteps[onboardingStep].content}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {context && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{context.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>CNPJ: {context.cnpj}</p>
                    <p>Regime: {context.regime}</p>
                    <p>Contador: {context.accountantName}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index <= onboardingStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {onboardingStep < onboardingSteps.length - 1 ? (
                    <Button 
                      onClick={() => setOnboardingStep(prev => prev + 1)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowOnboarding(false)}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Começar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Assistente Fiscal</CardTitle>
                  <CardDescription>
                    {context?.name} • {context?.regime}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  {context?.accountantName}
                </Badge>
                {isSpeaking && (
                  <Badge variant="default" className="gap-1 bg-success">
                    <Volume2 className="h-3 w-3" />
                    Falando
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Conversation */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processando...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isSpeaking ? stopCurrentAudio : undefined}
                variant={isSpeaking ? "destructive" : "outline"}
                size="lg"
                disabled={isProcessing}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-5 w-5 mr-2" />
                    Parar Áudio
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    Audio
                  </>
                )}
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                disabled={isProcessing || isSpeaking}
                className="bg-primary hover:bg-primary/90"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Parar Gravação
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Falar
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  const message = prompt("Digite sua pergunta:");
                  if (message) sendTextMessage(message);
                }}
                variant="outline"
                size="lg"
                disabled={isProcessing || isSpeaking}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Digitar
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendTextMessage("Quais são minhas próximas obrigações?")}
                disabled={isProcessing || isSpeaking}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Próximas Obrigações
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendTextMessage("Quando vence meu DAS?")}
                disabled={isProcessing || isSpeaking}
              >
                <Clock className="h-4 w-4 mr-1" />
                Vencimento DAS
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendTextMessage("Preciso agendar uma reunião")}
                disabled={isProcessing || isSpeaking}
              >
                <User className="h-4 w-4 mr-1" />
                Agendar Reunião
              </Button>
            </div>

            {isRecording && (
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 text-destructive">
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Gravando... Fale agora</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}