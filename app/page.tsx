'use client'

import { useState, useEffect } from 'react'
import Avatar from '@/components/Avatar'
import VoiceInterface from '@/components/VoiceInterface'
import ChatInterface from '@/components/ChatInterface'
import StatusIndicators from '@/components/StatusIndicators'
import { Settings, Mic, MicOff, MessageSquare } from 'lucide-react'

export default function Home() {
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  // Request microphone permission on load
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setMicPermission('granted'))
        .catch(() => setMicPermission('denied'))
    }
  }, [])

  const handleModeToggle = () => {
    setIsVoiceMode(!isVoiceMode)
    if (isVoiceMode) {
      setIsActive(false)
      setIsListening(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse"></div>
      
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleModeToggle}
          className={`p-3 rounded-full transition-all duration-300 ${
            isVoiceMode 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={isVoiceMode ? 'Switch to Manual Mode' : 'Switch to Voice Mode'}
        >
          {isVoiceMode ? <Mic size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

      {/* Status Indicators */}
      <StatusIndicators 
        isListening={isListening}
        isActive={isActive}
        isSpeaking={isSpeaking}
        transcript={transcript}
        micPermission={micPermission}
      />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Avatar Container */}
        <div className="relative w-full max-w-2xl h-96 mb-8">
          <Avatar 
            isListening={isListening}
            isSpeaking={isSpeaking}
            isActive={isActive}
          />
        </div>

        {/* Interface Mode */}
        {isVoiceMode ? (
          <VoiceInterface
            isActive={isActive}
            setIsActive={setIsActive}
            isListening={isListening}
            setIsListening={setIsListening}
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
            transcript={transcript}
            setTranscript={setTranscript}
            lastResponse={lastResponse}
            setLastResponse={setLastResponse}
            micPermission={micPermission}
          />
        ) : (
          <ChatInterface
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
            setLastResponse={setLastResponse}
          />
        )}
      </div>

      {/* Holographic Effects Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse delay-700"></div>
      </div>
    </div>
  )
}
