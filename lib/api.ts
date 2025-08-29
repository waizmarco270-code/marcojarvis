// lib/api.ts
import { Message } from './types';

/**
 * Sends a chat message to the MARCO API and gets a response.
 * @param messages - The conversation history.
 * @returns The AI's response message.
 */
export const getGroqCompletion = async (messages: Message[]): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Failed to get Groq completion:', error);
    return "I've encountered an internal error. Please try again shortly.";
  }
};

/**
 * Converts text to speech using the TTS API.
 * @param text - The text to be spoken.
 * @returns An audio blob of the spoken text.
 */
export const textToSpeech = async (text: string): Promise<Blob | null> => {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Failed to convert text to speech:', error);
    return null;
  }
};
