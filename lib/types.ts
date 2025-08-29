// src/lib/types.ts

// The state of the assistant
export type AssistantStatus = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'error';

// A single message in the conversation
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Props for the main page component
export interface HomePageProps {}

// Props for the AvatarCanvas component
export interface AvatarCanvasProps {
  status: AssistantStatus;
}
