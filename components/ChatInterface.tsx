'use client'


import { useState, useRef, useEffect } from 'react'
import { Send, Volume2, VolumeX } from 'lucide-react'

interface ChatInterfaceProps {
  isSpeaking: boolean
  setIsSpeaking: (speaking: boolean) => void
  setLastResponse: (response: string) => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ChatInterface({ 
  isSpeaking, 
  setIsSpeaking, 
  setLastResponse 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am MARCO, your AI assistant. How may I help you today?',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          sessionId: 'manual-chat-session'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from MARCO')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      setLastResponse(data.message)

      // Auto-speak the response
      await speakText(data.message)

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true)

      // Stop any current audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      // Call TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('TTS API request failed')
      }

      // Create audio from response
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      setCurrentAudio(audio)

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        setCurrentAudio(null)
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        setCurrentAudio(null)
      }

      await audio.play()

    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
      setCurrentAudio(null)
    }
  }

  const toggleMute = () => {
    if (currentAudio) {
      currentAudio.pause()
      setIsSpeaking(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How may I help you?',
        timestamp: new Date().toISOString()
      }
    ])
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-300">Manual Chat Mode</span>
        </div>
        <div className="flex space-x-2">
          {isSpeaking && (
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors"
              title="Stop Speaking"
            >
              <VolumeX size={16} />
            </button>
          )}
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              <div className="text-sm leading-relaxed">{message.content}</div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 border border-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-400">MARCO is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to MARCO..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          MARCO will speak responses automatically • Press Enter to send
        </div>
      </form>
    </div>
  )
}
