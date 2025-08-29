// components/interface/StatusDisplay.tsx
'use client';

import { AssistantStatus, Message } from '@/lib/types';
import TypingAnimation from '@/components/ui/TypingAnimation';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusDisplayProps {
  status: AssistantStatus;
  transcript: string;
  lastMessage?: Message;
}

const StatusLabel: React.FC<{ status: AssistantStatus }> = ({ status }) => {
  const statusConfig = {
    idle: { label: 'STANDBY', color: 'text-gray-400' },
    listening: { label: 'LISTENING...', color: 'text-cyan-400' },
    thinking: { label: 'PROCESSING...', color: 'text-yellow-400' },
    speaking: { label: 'RESPONDING...', color: 'text-purple-400' },
    error: { label: 'ERROR', color: 'text-red-500' },
  };

  const { label, color } = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`}
      />
      <span className={`font-mono text-sm uppercase ${color}`}>{label}</span>
    </div>
  );
};

export default function StatusDisplay({ status, transcript, lastMessage }: StatusDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-black/30 backdrop-blur-md border border-cyan-500/20 rounded-lg p-4 text-center flex flex-col gap-4">
      
      {/* Top Bar with Status */}
      <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
        <h2 className="font-mono text-lg text-cyan-300">M.A.R.C.O. Interface</h2>
        <StatusLabel status={status} />
      </div>

      {/* Main Display Area */}
      <div className="min-h-[100px] flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {status === 'listening' && transcript && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg text-gray-300 font-light"
            >
              <span className="text-cyan-400 font-mono text-xs block mb-1">USER INPUT:</span>
              "{transcript}"
            </motion.div>
          )}

          {status !== 'listening' && lastMessage?.role === 'assistant' && (
             <motion.div
              key="response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-left"
            >
              <span className="text-purple-400 font-mono text-xs block mb-1">MARCO RESPONSE:</span>
              <TypingAnimation text={lastMessage.content} />
            </motion.div>
          )}

          {status === 'idle' && !lastMessage && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500"
            >
              Awaiting activation...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
