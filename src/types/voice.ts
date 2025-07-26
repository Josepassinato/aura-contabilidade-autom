/**
 * Interfaces específicas para o sistema de voz
 */

export interface VoiceConfig {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
  autoStart: boolean;
  keywordActivation: boolean;
  keywords: string[];
  response_length: 'short' | 'medium' | 'long';
  permitirRelatorios: boolean;
  enableAdvancedFeatures: boolean;
  contextAware: boolean;
  personalityMode: 'professional' | 'friendly' | 'technical';
}

export interface VoiceMessage {
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  id: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceProcessingState {
  isListening: boolean;
  isProcessing: boolean;
  isGenerating: boolean;
  isSpeaking: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  webAudio: boolean;
  mediaRecorder: boolean;
}

export interface AudioSettings {
  inputDeviceId?: string;
  outputDeviceId?: string;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
  channelCount: number;
}