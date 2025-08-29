'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceInterfaceProps {
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

export default function VoiceInterface({
  isActive,
  setIsActive,
  isListening,
  setIsListening,
  isSpeaking,
  setIsSpeaking,
  transcript,
  setTranscript,
  lastResponse,
  setLastResponse,
  micPermission
}: VoiceInterfaceProps) {
  const [recognition, setRecognition] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const conversationRef = useRef<Array<{role: string, content: string}>>([])
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const speakText = useCallback(async (text: string) => {
    try {
      console.log('🔊 Speaking:', text)
      setIsSpeaking(true)
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      setCurrentAudio(audio)
      audio.onended = () => {
        console.log('🔇 Audio playback ended')
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        setCurrentAudio(null)
        // Restart recognition after speaking completes
        if (isActive && recognition) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Restarting recognition after speaking...');
            try {
              recognition.start();
            } catch (error) {
              console.log('Recognition restart failed:', error);
            }
          }, 500);
        }
      }
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        setCurrentAudio(null)
      }
      await audio.play()
    } catch (error) {
      console.error('💥 TTS error:', error)
      setIsSpeaking(false)
      setCurrentAudio(null)
    }
  }, [currentAudio, isActive, recognition])

  const handleWakeWord = useCallback(async () => {
    console.log('🚀 Wake word detected!')
    setIsActive(true)
    setTranscript('Wake word detected - MARCO is now active')
    
    // Stop and restart recognition to switch to single-phrase mode
    if (recognition) {
        recognition.stop();
    }
    await speakText("Hello Waiz Sama. MARCO is now active. How may I assist you?")
  }, [recognition, setIsActive, setTranscript, speakText])

  const handleGoodbye = useCallback(async () => {
    console.log('👋 MARCO shutting down...')
    setIsActive(false)
    setTranscript('')
    conversationRef.current = []
    
    await speakText("Shutting down... Goodbye Waiz Sama")
  }, [setIsActive, setTranscript, speakText])

  const handleChatMessage = useCallback(async (message: string) => {
    try {
      console.log('🤖 Processing message:', message)
      setTranscript(`Processing: "${message}"`)
      
      conversationRef.current.push({ role: 'user', content: message })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationRef.current,
          sessionId: 'voice-session'
        }),
      })

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`)
      }
      const data = await response.json()
      console.log('🤖 MARCO response:', data.message)
      conversationRef.current.push({ role: 'assistant', content: data.message })
      setLastResponse(data.message)
      await speakText(data.message)
    } catch (error) {
      console.error('💥 Chat error:', error)
      const errorMsg = "I apologize, but I encountered an issue processing your request."
      setLastResponse(errorMsg)
      await speakText(errorMsg)
    }
  }, [setTranscript, setLastResponse, speakText])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported')
      return
    }

    console.log('🎤 Initializing Speech Recognition...')
    const recognitionInstance = new SpeechRecognition()
    setRecognition(recognitionInstance)

    recognitionInstance.onstart = () => {
      console.log('🎤 Speech recognition started')
      setIsListening(true)
    }

    recognitionInstance.onend = () => {
      console.log('🎤 Speech recognition ended')
      setIsListening(false)
      
      // Auto-restart if the session ends unexpectedly
      if (micPermission === 'granted' && !isSpeaking) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Restarting speech recognition...');
          try {
            recognitionInstance.start();
          } catch (error) {
            console.log('Recognition restart failed:', error);
          }
        }, 500);
      }
    }

    recognitionInstance.onerror = (event: any) => {
      console.error('🚨 Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access and refresh the page.')
      }
    }

    recognitionInstance.onresult = (event: any) => {
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

      const currentTranscript = (finalTranscript || interimTranscript).trim()
      setTranscript(currentTranscript)

      if (finalTranscript && event.results[event.results.length - 1].isFinal) {
        console.log('📝 Final Transcript:', finalTranscript)
        
        if (isActive) {
          if (finalTranscript.toLowerCase().includes('goodbye')) {
            handleGoodbye()
            return
          }
          handleChatMessage(finalTranscript.trim())
        } else {
          if (currentTranscript.toLowerCase().includes('marco')) {
            handleWakeWord()
          }
        }
      }
    }

    setIsInitialized(true)

    return () => {
      if (recognitionInstance && recognitionInstance.abort) {
        recognitionInstance.abort()
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [isActive, isSpeaking, micPermission, handleWakeWord, handleGoodbye, handleChatMessage, currentAudio])

  // This effect manages starting and stopping the recognition instance
  // based on the `isActive` state and mic permission.
  useEffect(() => {
    if (!recognition || !isInitialized) return;

    if (micPermission === 'denied') {
      recognition.stop();
      return;
    }

    // Configure continuous mode based on active state
    recognition.continuous = !isActive;
    recognition.interimResults = true;

    // Start recognition
    try {
      if (!isListening) {
        console.log(`▶️ Starting speech recognition in ${isActive ? 'single-phrase' : 'continuous'} mode...`);
        recognition.start();
      }
    } catch (error) {
      console.log('Recognition already running or failed to start:', error);
    }

  }, [isActive, recognition, isInitialized, micPermission, isListening])


  const toggleMute = () => {
    if (currentAudio) {
      currentAudio.pause()
      setIsSpeaking(false)
    }
  }

  if (micPermission === 'denied') {
    return (
      <div className="text-center p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
          <MicOff className="mx-auto mb-2 text-red-400" size={32} />
          <h3 className="text-red-400 font-semibold mb-2">Microphone Access Required</h3>
          <p className="text-gray-300 text-sm mb-4">
            MARCO needs microphone permission for voice commands.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Refresh & Allow Microphone
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6 max-w-2xl mx-auto">
      {/* Voice Status */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className={`p-3 rounded-full ${
            isActive ? 'bg-blue-600 glow-blue' : 
            isListening ? 'bg-green-600 glow-green' : 
            'bg-gray-600'
          }`}>
            <Mic size={24} className="text-white" />
          </div>
          
          {isSpeaking && (
            <button onClick={toggleMute} className="p-3 rounded-full bg-purple-600 glow-purple">
              <Volume2 size={24} className="text-white" />
            </button>
          )}
        </div>

        <div className="text-center">
          <div className={`text-lg font-semibold mb-2 ${
            isActive ? 'text-blue-400' : 
            isListening ? 'text-green-400' : 
            'text-gray-400'
          }`}>
            {isActive ? '🔵 MARCO is Active - Listening...' : '🎤 Say "MARCO" to activate'}
          </div>

          {/* Debug Info */}
          <div className="text-xs text-gray-500 mb-2">
            Recognition: {isInitialized ? '✅' : '❌'} | 
            Listening: {isListening ? '🎤' : '🔇'} | 
            Speaking: {isSpeaking ? '🔊' : '🔇'}
          </div>

          {/* Voice Animation */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1 bg-blue-400 rounded-full voice-wave-${i}`}
                  style={{ animationDuration: '0.8s' }}
                />
              ))}
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-400 mb-1">
                {isActive ? 'You said:' : 'Listening for wake word:'}
              </div>
              <div className="text-white font-mono text-sm">"{transcript}"</div>
            </div>
          )}

          {/* Last Response */}
          {lastResponse && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
              <div className="text-sm text-blue-400 mb-1">MARCO responded:</div>
              <div className="text-white text-sm">{lastResponse}</div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-400 space-y-2">
        {!isActive ? (
          <>
            <p>🎤 Say <span className="text-blue-400 font-semibold">"MARCO"</span> clearly</p>
            <p>🔊 Make sure your microphone is working</p>
          </>
        ) : (
          <>
            <p>💬 Ask anything - MARCO is listening</p>
            <p>👋 Say <span className="text-orange-400 font-semibold">"Goodbye"</span> to deactivate</p>
          </>
        )}
      </div>
    </div>
  )
}
