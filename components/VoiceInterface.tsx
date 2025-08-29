'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { speechManager, wakeWordDetector } from '@/lib/speech'
import { speakText } from '@/lib/audio'
import { ChatMessage } from '@/lib/types'

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
  const conversationRef = useRef<ChatMessage[]>([])
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleWakeWord = useCallback(async () => {
    console.log('🚀 Wake word detected!')
    setIsActive(true)
    setTranscript('Wake word detected - MARCO is now active')
    
    // Speak greeting using centralized utility
    await speakText("Hello Waiz Sama. MARCO is now active. How may I assist you?")
    speechManager.updateConfig({ continuous: false })
  }, [setIsActive, setTranscript])

  const handleGoodbye = useCallback(async () => {
    console.log('👋 MARCO shutting down...')
    setIsActive(false)
    setTranscript('')
    conversationRef.current = []
    
    // Speak shutdown message using centralized utility
    await speakText("Shutting down... Goodbye Waiz Sama")
    speechManager.updateConfig({ continuous: true })
    speechManager.start()
  }, [setIsActive, setTranscript])

  const handleChatMessage = useCallback(async (message: string) => {
    try {
      console.log('🤖 Processing message:', message)
      setTranscript(`Processing: "${message}"`)

      const newMessage: ChatMessage = { role: 'user', content: message }
      conversationRef.current.push(newMessage)

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
      // Speak the response using the centralized utility
      await speakText(data.message)

    } catch (error) {
      console.error('💥 Chat error:', error)
      const errorMsg = "I apologize, but I encountered an issue processing your request."
      setLastResponse(errorMsg)
      await speakText(errorMsg)
    } finally {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
      recognitionTimeoutRef.current = setTimeout(() => {
        speechManager.start();
      }, 1000);
    }
  }, [setTranscript, setLastResponse])

  // Centralized Speech Recognition management
  useEffect(() => {
    if (micPermission === 'denied') return

    // Setup callbacks
    speechManager.onStart = () => setIsListening(true)
    speechManager.onEnd = () => setIsListening(false)
    speechManager.onResult = (finalTranscript, isFinal) => {
      setTranscript(finalTranscript)
      if (isFinal) {
        // Use the centralized wake word detector
        if (isActive && wakeWordDetector.detectGoodbye(finalTranscript)) {
          handleGoodbye()
        } else if (isActive) {
          handleChatMessage(finalTranscript)
        } else if (wakeWordDetector.detectWakeWord(finalTranscript)) {
          handleWakeWord()
        }
      }
    }
    speechManager.onError = (error) => {
      console.error('🚨 Speech recognition error:', error)
      setIsListening(false)
    }

    if (micPermission === 'granted') {
      speechManager.start()
    }

    return () => {
      speechManager.abort()
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current)
      }
    }
  }, [micPermission, isActive, setTranscript, setIsListening, handleWakeWord, handleGoodbye, handleChatMessage])

  const toggleMute = () => {
    // Calling speakText with no content will stop current playback
    speakText('')
    setIsSpeaking(false)
  }

  // Show error if mic permission denied
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
            {isActive ? '🔵 MARCO is Active - Listening...' : '🎤 Say "Wake up Marco" to activate'}
          </div>

          <div className="text-xs text-gray-500 mb-2">
            Recognition: {speechManager.isSupported() ? '✅' : '❌'} | 
            Listening: {isListening ? '🎤' : '🔇'} | 
            Speaking: {isSpeaking ? '🔊' : '🔇'}
          </div>

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

          {transcript && (
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-400 mb-1">
                {isActive ? 'You said:' : 'Listening for wake word:'}
              </div>
              <div className="text-white font-mono text-sm">"{transcript}"</div>
            </div>
          )}

          {lastResponse && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
              <div className="text-sm text-blue-400 mb-1">MARCO responded:</div>
              <div className="text-white text-sm">{lastResponse}</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-400 space-y-2">
        {!isActive ? (
          <>
            <p>🎤 Say <span className="text-blue-400 font-semibold">"Wake up Marco"</span> clearly</p>
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
