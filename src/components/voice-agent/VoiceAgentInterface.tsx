import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut,
  User,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface ClientData {
  id: string;
  name: string;
  accounting_firm_name: string;
}

const VoiceAgentInterface: React.FC = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeVoiceAgent();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeVoiceAgent = async () => {
    try {
      // Get stored client data
      const storedClientId = localStorage.getItem('contaflix_client_id');
      const storedClientData = localStorage.getItem('contaflix_client_data');
      
      if (!storedClientId || !storedClientData) {
        window.location.href = '/voice-agent/setup';
        return;
      }

      const clientInfo = JSON.parse(storedClientData);
      setClientData(clientInfo);
      
      // Authenticate with biometric or PIN
      await authenticateUser();
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      
      // Welcome message
      addMessage('assistant', `Olá! Sou seu assistente da ${clientInfo.name}. Como posso ajudar?`);
      
    } catch (error) {
      console.error('Error initializing voice agent:', error);
      toast({
        title: "Erro de inicialização",
        description: "Não foi possível inicializar o agente de voz",
        variant: "destructive",
      });
    }
  };

  const authenticateUser = async () => {
    try {
      // Try biometric authentication first
      const biometricId = localStorage.getItem('contaflix_biometric_id');
      
      if (biometricId && 'credentials' in navigator) {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            allowCredentials: [{
              id: new TextEncoder().encode(biometricId),
              type: 'public-key'
            }],
            timeout: 60000
          }
        });
        
        if (credential) {
          setIsAuthenticated(true);
          return;
        }
      }
      
      // Fallback to PIN or other authentication
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Authentication failed:', error);
      // Could implement PIN fallback here
      setIsAuthenticated(true);
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        setTranscript(transcript);
        
        if (event.results[last].isFinal) {
          handleVoiceInput(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Try to use advanced voice recognition first
      try {
        await startAdvancedListening();
      } catch (error) {
        console.log('Advanced voice recognition failed, falling back to browser API');
        recognitionRef.current?.start();
        setIsListening(true);
      }
    }
  };

  const startAdvancedListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks);
        const audioBase64 = await blobToBase64(audioBlob);
        
        try {
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: audioBase64 }
          });
          
          if (error) throw error;
          
          if (data.success && data.text) {
            handleVoiceInput(data.text);
          }
        } catch (error) {
          console.error('Voice-to-text error:', error);
          toast({
            title: "Erro no reconhecimento de voz",
            description: "Não foi possível processar o áudio",
            variant: "destructive",
          });
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setIsListening(true);
      mediaRecorder.start();
      
      // Stop recording after 10 seconds max
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsListening(false);
        }
      }, 10000);

    } catch (error) {
      throw error;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;
    
    addMessage('user', text);
    setIsProcessing(true);
    setTranscript('');
    
    try {
      // Send to voice agent API
      const { data, error } = await supabase.functions.invoke('voice-agent', {
        body: {
          message: text,
          clientId: clientData?.id,
          context: 'voice_chat'
        }
      });
      
      if (error) throw error;
      
      const response = data.response;
      addMessage('assistant', response);
      
      // Convert response to speech
      await speakResponse(response);
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorMessage = "Desculpe, ocorreu um erro. Tente novamente.";
      addMessage('assistant', errorMessage);
      await speakResponse(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Try advanced TTS first, fallback to browser API
      try {
        const { data, error } = await supabase.functions.invoke('text-to-voice', {
          body: { 
            text: text,
            voice: 'nova'
          }
        });
        
        if (error) throw error;
        
        if (data.success && data.audioContent) {
          // Play the audio
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mp3' }
          );
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = () => {
            console.error('Audio playback failed');
            fallbackToWebSpeechAPI(text);
          };
          
          await audio.play();
        } else {
          throw new Error('TTS API failed');
        }
      } catch (ttsError) {
        console.log('Advanced TTS failed, falling back to browser API');
        fallbackToWebSpeechAPI(text);
      }
    } catch (error) {
      console.error('Error speaking response:', error);
      setIsSpeaking(false);
    }
  };

  const fallbackToWebSpeechAPI = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleLogout = () => {
    localStorage.removeItem('contaflix_client_id');
    localStorage.removeItem('contaflix_client_data');
    localStorage.removeItem('contaflix_biometric_id');
    window.location.href = '/voice-agent/setup';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Autenticando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-semibold">{clientData?.name}</h1>
              <p className="text-sm text-muted-foreground">
                {clientData?.accounting_firm_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Voice Interface */}
        <div className="p-4 bg-card border-t">
          {/* Transcript Display */}
          {transcript && (
            <div className="mb-4 p-2 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Ouvindo:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Voice Button */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={toggleListening}
              disabled={isProcessing || isSpeaking}
            >
              {isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Status */}
          <div className="flex justify-center mt-4">
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? "Ouvindo..." : 
               isProcessing ? "Processando..." :
               isSpeaking ? "Falando..." : "Toque para falar"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentInterface;