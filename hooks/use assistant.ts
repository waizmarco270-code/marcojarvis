// src/hooks/useAssistant.ts
import { useState, useEffect, useCallback } from 'react';
import { AssistantStatus, Message } from '@/lib/types';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useAudioManager } from './useAudioManager';
import { getGroqCompletion } from '@/lib/api';

export const useAssistant = () => {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  
  const { playActivationSound, playDeactivationSound, speak, isSpeaking } = useAudioManager();

  const handleNewTranscript = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handleWakeWord = useCallback(() => {
    setStatus('listening');
    playActivationSound();
  }, [playActivationSound]);

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onTranscript: handleNewTranscript,
    onWakeWord: handleWakeWord,
  });

  const processTranscript = useCallback(async () => {
    if (transcript.trim().length > 0) {
      const newMessage: Message = { role: 'user', content: transcript };
      setMessages((prev) => [...prev, newMessage]);
      setStatus('thinking');
      
      const aiResponse = await getGroqCompletion([...messages, newMessage]);
      
      const aiMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
      
      setStatus('speaking');
      await speak(aiResponse);
      setStatus('idle');
    }
  }, [transcript, messages, speak]);

  useEffect(() => {
    if (!isListening && status === 'listening') {
      processTranscript();
    }
  }, [isListening, status, processTranscript]);

  const toggleAssistant = () => {
    if (status === 'idle') {
      startListening();
      setStatus('listening');
      playActivationSound();
    } else {
      stopListening();
      setStatus('idle');
      playDeactivationSound();
    }
  };
  
  return {
    status,
    messages,
    transcript,
    isListening,
    isSpeaking,
    toggleAssistant,
  };
};
