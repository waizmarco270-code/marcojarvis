// components/interface/Avatar/AvatarCanvas.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { AssistantStatus } from '@/lib/types';
import Hologram from './Hologram';
import Effects from './Effects';

export default function AvatarCanvas({ status }: { status: AssistantStatus }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#00ffff" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#ff00ff" intensity={2} />
      
      <Hologram status={status} />
      <Effects status={status} />
    </Canvas>
  );
}
