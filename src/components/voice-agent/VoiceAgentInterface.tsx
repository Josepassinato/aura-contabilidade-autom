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
import { authStorage } from '@/utils/secureStorage';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);
  const initializationStateRef = useRef<'idle' | 'initializing' | 'completed' | 'failed'>('idle');
  const operationLockRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      // Prevent multiple concurrent initializations
      if (initializationStateRef.current !== 'idle') {
        return;
      }
      
      initializationStateRef.current = 'initializing';
      
      try {
        if (isMounted) {
          await initializeVoiceAgent();
          if (isMounted) {
            initializationStateRef.current = 'completed';
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        if (isMounted) {
          initializationStateRef.current = 'failed';
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
      initializationStateRef.current = 'idle';
      operationLockRef.current.clear();
      
      // Execute all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Cleanup function failed:', error);
        }
      });
      cleanupFunctionsRef.current = [];
      
      // Cleanup speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onstart = null;
          if (recognitionRef.current.state === 'started') {
            recognitionRef.current.stop();
          }
        } catch (error) {
          console.warn('Recognition cleanup failed:', error);
        }
        recognitionRef.current = null;
      }
      
      // Cleanup media recorder
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        } catch (error) {
          console.warn('MediaRecorder cleanup failed:', error);
        }
        mediaRecorderRef.current = null;
      }
      
      // Cleanup media stream
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
        } catch (error) {
          console.warn('Stream cleanup failed:', error);
        }
        streamRef.current = null;
      }
      
      // Cleanup audio context
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
          }
        } catch (error) {
          console.warn('AudioContext cleanup failed:', error);
        }
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeVoiceAgent = async () => {
    // Prevent concurrent execution
    if (operationLockRef.current.has('initialize')) {
      return;
    }
    
    operationLockRef.current.add('initialize');
    
    try {
      // Get stored client data using secure storage
      const storedClientId = authStorage.getClientId();
      const storedClientData = authStorage.getClientData();
      
      if (!storedClientId || !storedClientData) {
        // Only redirect to setup if there's no access token indicating we came from a valid route
        const accessToken = authStorage.getAccessToken();
        if (!accessToken) {
          try {
            window.location.replace('/voice-agent/setup');
          } catch (navError) {
            window.location.href = '/voice-agent/setup';
          }
          return;
        } else {
          toast({
            title: "Dados não encontrados",
            description: "Escaneie o QR code novamente ou configure o acesso",
            variant: "destructive",
          });
          try {
            window.location.replace('/voice-agent/setup');
          } catch (navError) {
            window.location.href = '/voice-agent/setup';
          }
          return;
        }
      }

      // Validate stored client data structure
      if (!storedClientData.id || !storedClientData.name) {
        console.error('Invalid client data structure');
        // Clear corrupted data and redirect
        authStorage.clearAll();
        toast({
          title: "Dados corrompidos",
          description: "Dados armazenados inválidos. Configure o acesso novamente.",
          variant: "destructive",
        });
        setTimeout(() => {
          try {
            window.location.replace('/voice-agent/setup');
          } catch (navError) {
            window.location.href = '/voice-agent/setup';
          }
        }, 2000);
        return;
      }
      
      setClientData(storedClientData);
      
      // Authenticate with biometric or PIN
      await authenticateUser();
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      
      // Welcome message
      addMessage('assistant', `Olá! Sou seu assistente da ${storedClientData.name}. Como posso ajudar?`);
      
    } catch (error) {
      console.error('Error initializing voice agent:', error);
      toast({
        title: "Erro de inicialização",
        description: "Não foi possível inicializar o agente de voz",
        variant: "destructive",
      });
    } finally {
      operationLockRef.current.delete('initialize');
    }
  };

  const authenticateUser = async () => {
    // Prevent concurrent authentication attempts
    if (operationLockRef.current.has('authenticate')) {
      return;
    }
    
    operationLockRef.current.add('authenticate');
    
    try {
      // Validate stored token first
      const accessToken = authStorage.getAccessToken();
      const clientId = authStorage.getClientId();
      
      if (!accessToken || !clientId) {
        throw new Error('Missing authentication credentials');
      }
      
      // Validate token with backend
      try {
        const decodedToken = JSON.parse(atob(accessToken));
        
        // Check token expiration (if not setup token)
        if (!decodedToken.setup && decodedToken.expires && Date.now() > decodedToken.expires) {
          throw new Error('Token expired');
        }
        
        // Validate client exists and token is valid
        const { data: client, error } = await supabase
          .from('accounting_clients')
          .select('id, name, status')
          .eq('id', decodedToken.clientId || clientId)
          .eq('status', 'active')
          .single();
          
        if (error || !client) {
          throw new Error('Invalid client or inactive account');
        }
        
      } catch (tokenError) {
        throw new Error('Invalid or corrupted token');
      }
      
      // Try biometric authentication if available
      const biometricId = authStorage.getBiometricId();
      
      if (biometricId && 'credentials' in navigator && window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          
          if (available) {
            const credential = await navigator.credentials.get({
              publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                allowCredentials: [{
                  id: new TextEncoder().encode(biometricId),
                  type: 'public-key'
                }],
                timeout: 30000,
                userVerification: 'required'
              }
            });
            
            if (credential) {
              setIsAuthenticated(true);
              return;
            }
          }
        } catch (biometricError) {
          console.log('Biometric authentication failed, requiring manual confirmation');
        }
      }
      
      // Fallback: Require user confirmation for access
      const userConfirmed = confirm(
        `Confirmar acesso à conta ${clientData?.name || 'empresa'}?\n\nClique OK para continuar ou Cancelar para sair.`
      );
      
      if (userConfirmed) {
        setIsAuthenticated(true);
      } else {
        throw new Error('Authentication denied by user');
      }
      
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Clear all auth data and redirect
      authStorage.clearAll();
      
      toast({
        title: "Autenticação Falhou",
        description: "Credenciais inválidas. Reconfigure o acesso.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        try {
          window.location.replace('/voice-agent/setup');
        } catch (navError) {
          window.location.href = '/voice-agent/setup';
        }
      }, 2000);
    } finally {
      operationLockRef.current.delete('authenticate');
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
    // Prevent concurrent listening operations
    if (operationLockRef.current.has('listening')) {
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      operationLockRef.current.add('listening');
      
      try {
        // Check microphone permissions first
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permissionStatus.state === 'denied') {
            toast({
              title: "Permissão negada",
              description: "Por favor, permita o acesso ao microfone nas configurações do navegador",
              variant: "destructive",
            });
            return;
          }
        } catch (e) {
          // Permissions API not supported, continue
        }

        // Try to use advanced voice recognition first
        try {
          await startAdvancedListening();
        } catch (error) {
          console.log('Advanced voice recognition failed, falling back to browser API');
          if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
          } else {
            toast({
              title: "Reconhecimento de voz não suportado",
              description: "Seu navegador não suporta reconhecimento de voz",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error starting listening:', error);
        toast({
          title: "Erro ao iniciar gravação",
          description: "Não foi possível iniciar o reconhecimento de voz",
          variant: "destructive",
        });
      } finally {
        operationLockRef.current.delete('listening');
      }
    }
  };

  const startAdvancedListening = async () => {
    // Additional check to prevent race conditions
    if (isListening || (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive')) {
      return;
    }
    
    try {
      // Check MediaRecorder support (iOS Safari doesn't support it)
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder not supported');
      }

      // Clean up any existing recording first
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('Error stopping existing recorder:', e);
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      // Store stream reference for cleanup
      streamRef.current = stream;
      
      let mediaRecorder: MediaRecorder;
      const audioChunks: Blob[] = [];

      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
      } catch (e) {
        // Fallback for Safari
        mediaRecorder = new MediaRecorder(stream);
      }

      // Store mediaRecorder reference for cleanup
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioBase64 = await blobToBase64(audioBlob);
          
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: audioBase64 }
          });
          
          if (error) throw error;
          
          if (data.success && data.text) {
            handleVoiceInput(data.text);
          } else {
            throw new Error('No text recognized');
          }
        } catch (error) {
          console.error('Voice-to-text error:', error);
          toast({
            title: "Erro no reconhecimento de voz",
            description: "Não foi possível processar o áudio. Tente novamente.",
            variant: "destructive",
          });
        } finally {
          // Clean up resources
          cleanupRecordingResources();
        }
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        cleanupRecordingResources();
      };

      setIsListening(true);
      mediaRecorder.start();
      
      // Auto-stop after 10 seconds with proper cleanup
      const timeoutId = setTimeout(() => {
        try {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } catch (e) {
          console.warn('Error stopping recorder on timeout:', e);
        }
      }, 10000);

      // Store cleanup function for this recording session
      const sessionCleanup = () => {
        clearTimeout(timeoutId);
        if (stream.active) {
          stream.getTracks().forEach(track => track.stop());
        }
        try {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        } catch (e) {
          console.warn('Error stopping recorder in cleanup:', e);
        }
      };

      // Add to cleanup functions array
      cleanupFunctionsRef.current.push(sessionCleanup);

    } catch (error) {
      cleanupRecordingResources();
      throw error;
    }
  };

  const cleanupRecordingResources = () => {
    setIsListening(false);
    
    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clean up media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
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
    if (!text.trim() || isProcessing) return;
    
    // Prevent concurrent voice processing
    if (operationLockRef.current.has('processing')) {
      return;
    }
    
    operationLockRef.current.add('processing');
    
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
      operationLockRef.current.delete('processing');
    }
  };

  const speakResponse = async (text: string) => {
    // Prevent concurrent TTS operations
    if (operationLockRef.current.has('speaking') || isSpeaking) {
      return;
    }
    
    operationLockRef.current.add('speaking');
    
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
          // Play the audio with proper error handling
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mp3' }
          );
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          // Create promise for audio playback
          const playAudio = () => {
            return new Promise<void>((resolve, reject) => {
              audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                resolve();
              };
              
              audio.onerror = (e) => {
                console.error('Audio playback failed:', e);
                URL.revokeObjectURL(audioUrl);
                setIsSpeaking(false);
                reject(new Error('Audio playback failed'));
              };
              
              // Handle autoplay policy restrictions
              audio.play().catch((playError) => {
                console.error('Autoplay prevented:', playError);
                URL.revokeObjectURL(audioUrl);
                setIsSpeaking(false);
                reject(playError);
              });
            });
          };

          try {
            await playAudio();
          } catch (playError) {
            // If audio playback fails, fall back to browser TTS
            throw new Error('Audio playback failed');
          }
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
    } finally {
      operationLockRef.current.delete('speaking');
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
    // Clean all stored data using secure storage
    authStorage.clearAll();
    
    // Robust navigation with fallback
    try {
      window.location.replace('/voice-agent/setup');
    } catch (navError) {
      console.warn('Replace failed, using href fallback:', navError);
      window.location.href = '/voice-agent/setup';
    }
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