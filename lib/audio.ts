// Audio utilities for MARCO AI Assistant

export class AudioManager {
  private currentAudio: HTMLAudioElement | null = null
  private volume: number = 0.8

  async playTTSAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any current audio
        this.stopCurrentAudio()

        // Create audio URL
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        // Set volume
        audio.volume = this.volume

        // Store reference
        this.currentAudio = audio

        // Setup event listeners
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve()
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          reject(new Error('Audio playback failed'))
        }

        // Play audio
        audio.play().catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume
    }
  }

  getVolume(): number {
    return this.volume
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused
  }
}

// Singleton instance
export const audioManager = new AudioManager()

// Utility function for TTS
export async function speakText(text: string, voiceId?: string): Promise<void> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
    })

    if (!response.ok) {
      throw new Error('TTS request failed')
    }

    const audioBlob = await response.blob()
    await audioManager.playTTSAudio(audioBlob)
  } catch (error) {
    console.error('TTS Error:', error)
    throw error
  }
}

// Audio context for Web Audio API (if needed for advanced features)
export class AudioContextManager {
  private audioContext: AudioContext | null = null

  getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  async resumeAudioContext(): Promise<void> {
    const context = this.getAudioContext()
    if (context.state === 'suspended') {
      await context.resume()
    }
  }

  closeAudioContext(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export const audioContextManager = new AudioContextManager()