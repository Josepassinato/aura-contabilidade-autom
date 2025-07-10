/**
 * MediaRecorder utilities for cross-browser compatibility
 */

export interface MediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}

export interface BrowserCapabilities {
  hasMediaRecorder: boolean;
  hasGetUserMedia: boolean;
  supportedMimeTypes: string[];
  isIOS: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
}

/**
 * Detect browser capabilities for audio recording
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  const userAgent = navigator.userAgent || '';
  
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  const supportedMimeTypes: string[] = [];
  
  if (hasMediaRecorder) {
    const testTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
      'audio/mpeg'
    ];
    
    testTypes.forEach(type => {
      if (MediaRecorder.isTypeSupported(type)) {
        supportedMimeTypes.push(type);
      }
    });
  }
  
  return {
    hasMediaRecorder,
    hasGetUserMedia,
    supportedMimeTypes,
    isIOS,
    isSafari,
    isChrome,
    isFirefox
  };
}

/**
 * Get optimal MediaRecorder configuration for current browser
 */
export function getOptimalRecorderConfig(capabilities: BrowserCapabilities): MediaRecorderOptions {
  const config: MediaRecorderOptions = {};
  
  // Select best supported MIME type
  if (capabilities.supportedMimeTypes.length > 0) {
    // Prefer WebM with Opus for quality and compression
    if (capabilities.supportedMimeTypes.includes('audio/webm;codecs=opus')) {
      config.mimeType = 'audio/webm;codecs=opus';
    } else if (capabilities.supportedMimeTypes.includes('audio/webm')) {
      config.mimeType = 'audio/webm';
    } else {
      // Use first available type
      config.mimeType = capabilities.supportedMimeTypes[0];
    }
  }
  
  // Set optimal bitrate based on browser
  if (capabilities.isIOS || capabilities.isSafari) {
    config.audioBitsPerSecond = 64000; // Lower bitrate for Safari/iOS
  } else {
    config.audioBitsPerSecond = 128000; // Higher quality for other browsers
  }
  
  return config;
}

/**
 * Get optimal getUserMedia constraints for current browser
 */
export function getOptimalAudioConstraints(capabilities: BrowserCapabilities): MediaStreamConstraints {
  const audioConstraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };
  
  // iOS/Safari specific optimizations
  if (capabilities.isIOS || capabilities.isSafari) {
    audioConstraints.sampleRate = 44100;
    audioConstraints.channelCount = 1; // Mono for better compatibility
  } else {
    audioConstraints.sampleRate = 48000;
    audioConstraints.channelCount = 2; // Stereo for better quality
  }
  
  return {
    audio: audioConstraints,
    video: false
  };
}

/**
 * Create a cross-browser compatible MediaRecorder
 */
export async function createCompatibleMediaRecorder(
  stream: MediaStream,
  capabilities: BrowserCapabilities
): Promise<MediaRecorder> {
  if (!capabilities.hasMediaRecorder) {
    throw new Error('MediaRecorder not supported in this browser');
  }
  
  const config = getOptimalRecorderConfig(capabilities);
  
  try {
    // Try with optimal config first
    if (config.mimeType) {
      return new MediaRecorder(stream, config);
    } else {
      // Fallback to basic MediaRecorder
      return new MediaRecorder(stream);
    }
  } catch (error) {
    console.warn('Failed to create MediaRecorder with optimal config, using fallback:', error);
    
    // Try without specific config
    try {
      return new MediaRecorder(stream);
    } catch (fallbackError) {
      console.error('Failed to create MediaRecorder even with fallback:', fallbackError);
      throw new Error('Unable to create MediaRecorder in this browser');
    }
  }
}

/**
 * Polyfill for MediaRecorder in unsupported browsers
 */
export class MediaRecorderPolyfill {
  private stream: MediaStream;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private audioData: Float32Array[] = [];
  private isRecording = false;
  
  public ondataavailable: ((event: { data: Blob }) => void) | null = null;
  public onstop: (() => void) | null = null;
  public onerror: ((error: Error) => void) | null = null;
  
  constructor(stream: MediaStream) {
    this.stream = stream;
  }
  
  get state(): 'inactive' | 'recording' | 'paused' {
    return this.isRecording ? 'recording' : 'inactive';
  }
  
  start(): void {
    if (this.isRecording) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Use ScriptProcessorNode for older browsers
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        if (this.isRecording) {
          const inputBuffer = event.inputBuffer.getChannelData(0);
          this.audioData.push(new Float32Array(inputBuffer));
        }
      };
      
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isRecording = true;
      this.audioData = [];
    } catch (error) {
      this.onerror?.(error as Error);
    }
  }
  
  stop(): void {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Convert audio data to WAV blob
    const blob = this.createWAVBlob();
    this.ondataavailable?.({ data: blob });
    this.onstop?.();
  }
  
  private createWAVBlob(): Blob {
    // Simple WAV file creation from PCM data
    const length = this.audioData.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 44100, true);
    view.setUint32(28, 44100 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (const chunk of this.audioData) {
      for (let i = 0; i < chunk.length; i++) {
        const sample = Math.max(-1, Math.min(1, chunk[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }
}

/**
 * Get MediaRecorder or polyfill based on browser support
 */
export async function getCompatibleMediaRecorder(
  stream: MediaStream
): Promise<MediaRecorder | MediaRecorderPolyfill> {
  const capabilities = detectBrowserCapabilities();
  
  if (capabilities.hasMediaRecorder) {
    return createCompatibleMediaRecorder(stream, capabilities);
  } else {
    console.warn('MediaRecorder not supported, using polyfill');
    return new MediaRecorderPolyfill(stream);
  }
}