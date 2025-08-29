// hooks/useAudioManager.ts
import { useState, useCallback, useRef } from 'react';
import { textToSpeech } from '@/lib/api';

export const useAudioManager = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((src: string) => {
    try {
      const audio = new Audio(src);
      audio.play();
    } catch (error) {
      console.error(`Could not play sound effect: ${src}`, error);
    }
  }, []);

  const playActivationSound = useCallback(() => {
    playSound('/sfx/activate.mp3');
  }, [playSound]);

  const playDeactivationSound = useCallback(() => {
    playSound('/sfx/deactivate.mp3');
  }, [playSound]);

  const speak = useCallback(async (text: string) => {
    if (!text) return;

    setIsSpeaking(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const audioBlob = await textToSpeech(text);
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        return new Promise<void>((resolve) => {
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.play();
        });
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    speak,
    playActivationSound,
    playDeactivationSound,
  };
};
