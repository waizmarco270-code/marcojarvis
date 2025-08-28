// Speech Recognition Types
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean
  grammars: SpeechGrammarList
  interimResults: boolean
  lang: string
  maxAlternatives: number
  serviceURI: string
  
  start(): void
  stop(): void
  abort(): void
  
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
}

// Chat Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ChatResponse {
  message: string
  sessionId: string
  timestamp: string
}

// Search Types
export interface SearchQuery {
  q: string
}

export interface SearchResult {
  title: string
  link: string
  snippet: string
}

export interface SearchResponse {
  query: string
  answerBox: any | null
  summary: string
  sources: SearchResult[]
  searchTime: string
}

// TTS Types
export interface TTSRequest {
  text: string
  voiceId?: string
}

// Health Check Types
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  project: string
  apis: {
    groq: boolean
    serper: boolean
    elevenlabs: boolean
  }
  features: {
    voice_recognition: string
    text_to_speech: string
    ai_chat: string
    web_search: string
    avatar: string
  }
  wake_word: string
  shutdown_phrase: string
  master: string
}

// Component Props Types
export interface AvatarProps {
  isListening: boolean
  isSpeaking: boolean
  isActive: boolean
}

export interface VoiceInterfaceProps {
  isActive: boolean
  setIsActive: (active: boolean) => void
  isListening: boolean
  setIsListening: (listening: boolean) => void
  isSpeaking: boolean
  setIsSpeaking: (speaking: boolean) => void
  transcript: string
  setTranscript: (transcript: string) => void
  lastResponse: string
  setLastResponse: (response: string) => void
  micPermission: 'granted' | 'denied' | 'prompt'
}

export interface StatusIndicatorsProps {
  isListening: boolean
  isActive: boolean
  isSpeaking: boolean
  transcript: string
  micPermission: 'granted' | 'denied' | 'prompt'
}

// Audio Playback Types
export interface AudioState {
  isPlaying: boolean
  currentAudio: HTMLAudioElement | null
  volume: number
}

// API Error Types
export interface APIError {
  error: string
  details?: string
  status?: number
}