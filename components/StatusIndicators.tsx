'use client'

import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'

interface StatusIndicatorsProps {
  isListening: boolean
  isActive: boolean
  isSpeaking: boolean
  transcript: string
  micPermission: 'granted' | 'denied' | 'prompt'
}

export default function StatusIndicators({
  isListening,
  isActive,
  isSpeaking,
  transcript,
  micPermission
}: StatusIndicatorsProps) {
  return (
    <div className="fixed top-4 left-4 z-50 space-y-3">
      {/* Microphone Status */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${
        micPermission === 'denied' 
          ? 'bg-red-900/20 border-red-500 text-red-400' 
          : isActive && isListening
          ? 'bg-green-900/20 border-green-500 text-green-400 glow-green'
          : isListening
          ? 'bg-blue-900/20 border-blue-500 text-blue-400 glow-blue'
          : 'bg-gray-900/20 border-gray-500 text-gray-400'
      }`}>
        {micPermission === 'denied' ? (
          <>
            <MicOff size={16} />
            <span className="text-sm font-medium">Mic Denied</span>
          </>
        ) : isListening ? (
          <>
            <Mic size={16} className="animate-pulse" />
            <span className="text-sm font-medium">
              {isActive ? 'Listening' : 'Idle Listen'}
            </span>
          </>
        ) : (
          <>
            <MicOff size={16} />
            <span className="text-sm font-medium">Mic Off</span>
          </>
        )}
      </div>

      {/* Speaking Status */}
      {isSpeaking && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-purple-900/20 border-purple-500 text-purple-400 glow-purple backdrop-blur-sm">
          <Volume2 size={16} className="animate-pulse" />
          <span className="text-sm font-medium">MARCO Speaking</span>
        </div>
      )}

      {/* Active Status */}
      {isActive && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-blue-900/20 border-blue-500 text-blue-400 glow-blue backdrop-blur-sm">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">MARCO Active</span>
        </div>
      )}

      {/* Transcript Bubble */}
      {transcript && (
        <div className="max-w-xs bg-black/50 backdrop-blur-sm border border-gray-600 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">
            {isActive ? 'Transcript:' : 'Listening for:'}
          </div>
          <div className="text-sm text-white font-mono break-words">
            "{transcript}"
          </div>
        </div>
      )}

      {/* Permission Warning */}
      {micPermission === 'denied' && (
        <div className="max-w-xs bg-red-900/20 backdrop-blur-sm border border-red-500 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-red-400 font-medium mb-1">
                Microphone Required
              </div>
              <div className="text-xs text-red-300">
                Please refresh and allow microphone access for voice features.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}