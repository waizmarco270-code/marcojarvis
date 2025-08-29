// components/interface/VoiceMode.tsx
'use client';

import { AssistantStatus } from '@/lib/types';
import { Mic, Power } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceModeProps {
  status: AssistantStatus;
  toggleAssistant: () => void;
}

export default function VoiceMode({ status, toggleAssistant }: VoiceModeProps) {
  const isActive = status !== 'idle';

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={toggleAssistant}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300
          ${isActive ? 'bg-cyan-500/20 border-cyan-400' : 'bg-gray-700/50 border-gray-600'}
          border-2`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400"
            animate={{ scale: [1, 1.2], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {isActive ? <Mic className="w-8 h-8 text-cyan-300" /> : <Power className="w-8 h-8 text-gray-400" />}
      </motion.button>
      <p className="font-mono text-xs text-gray-500">
        {isActive ? 'Tap to Deactivate' : 'Tap to Activate'}
      </p>
    </div>
  );
}
