// Speech Recognition utilities for MARCO AI Assistant

interface SpeechRecognitionConfig {
  continuous: boolean
  interimResults: boolean
  language: string
  maxAlternatives: number
}

export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null
  private isListening: boolean = false
  private config: SpeechRecognitionConfig = {
    continuous: true,
    interimResults: true,
    language: 'en-US',
    maxAlternatives: 1
  }

  // Event callbacks
  public onStart: (() => void) | null = null
  public onEnd: (() => void) | null = null
  public onResult: ((transcript: string, isFinal: boolean) => void) | null = null
  public onError: ((error: string) => void) | null = null

  constructor() {
    this.initializeRecognition()
  }

  private initializeRecognition(): void {
    if (typeof window === 'undefined') return

    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognition()
    this.setupRecognition()
  }

  private setupRecognition(): void {
    if (!this.recognition) return

    // Configure recognition
    this.recognition.continuous = this.config.continuous
    this.recognition.interimResults = this.config.interimResults
    this.recognition.lang = this.config.language
    this.recognition.maxAlternatives = this.config.maxAlternatives

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true
      this.onStart?.()
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.onEnd?.()
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Call the result callback
      if (finalTranscript) {
        this.onResult?.(finalTranscript.trim(), true)
      } else if (interimTranscript) {
        this.onResult?.(interimTranscript.trim(), false)
      }
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      this.onError?.(event.error)
    }
  }

  public start(): void {
    if (!this.recognition) {
      console.warn('Speech recognition not available')
      return
    }

    if (!this.isListening) {
      try {
        this.recognition.start()
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
      }
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  public abort(): void {
    if (this.recognition) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  public getIsListening(): boolean {
    return this.isListening
  }

  public isSupported(): boolean {
    return this.recognition !== null
  }

  public updateConfig(newConfig: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig }
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous
      this.recognition.interimResults = this.config.interimResults
      this.recognition.lang = this.config.language
      this.recognition.maxAlternatives = this.config.maxAlternatives
    }
  }
}

// Wake word detection utility
export class WakeWordDetector {
  private wakeWords: string[] = ['wake up marco', 'hey marco', 'marco']
  private goodbyeWords: string[] = ['goodbye', 'bye', 'shutdown', 'goodnight']

  public detectWakeWord(transcript: string): boolean {
    const lowerTranscript = transcript.toLowerCase().trim()
    return this.wakeWords.some(word => lowerTranscript.includes(word))
  }

  public detectGoodbye(transcript: string): boolean {
    const lowerTranscript = transcript.toLowerCase().trim()
    return this.goodbyeWords.some(word => lowerTranscript.includes(word))
  }

  public addWakeWord(word: string): void {
    if (!this.wakeWords.includes(word.toLowerCase())) {
      this.wakeWords.push(word.toLowerCase())
    }
  }

  public removeWakeWord(word: string): void {
    this.wakeWords = this.wakeWords.filter(w => w !== word.toLowerCase())
  }

  public getWakeWords(): string[] {
    return [...this.wakeWords]
  }
}

// Utility functions
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop()) // Stop immediately, just testing permission
    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}

export function checkSpeechRecognitionSupport(): boolean {
  return typeof window !== 'undefined' && 
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

// Export singleton instances
export const speechManager = new SpeechRecognitionManager()
export const wakeWordDetector = new WakeWordDetector()