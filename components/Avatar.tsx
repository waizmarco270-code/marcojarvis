'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Sphere, useGLTF, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface AvatarProps {
  isListening: boolean
  isSpeaking: boolean
  isActive: boolean
}

// Holographic Avatar Mesh Component
function HolographicAvatar({ isListening, isSpeaking, isActive }: AvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_GLTF_URL || '/avatar.glb'

  // Try to load custom avatar, fallback to default sphere
  let gltf
  try {
    gltf = useGLTF(avatarUrl)
  } catch (error) {
    console.warn('Could not load avatar GLB, using fallback sphere')
    gltf = null
  }

  // Create holographic material
  const holographicMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: isActive ? '#3b82f6' : isListening ? '#22c55e' : '#6b7280',
      transparent: true,
      opacity: 0.7,
      emissive: isActive ? '#1e40af' : isListening ? '#16a34a' : '#374151',
      emissiveIntensity: 0.3,
      shininess: 100,
      wireframe: false,
    })
  }, [isActive, isListening])

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.getElapsedTime()

    // Base floating animation
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.1

    // Rotation based on state
    if (isActive) {
      meshRef.current.rotation.y = time * 0.3
    } else if (isListening) {
      meshRef.current.rotation.y = Math.sin(time * 2) * 0.1
    } else {
      meshRef.current.rotation.y = time * 0.05
    }

    // Scaling animation for speaking
    if (isSpeaking) {
      const scale = 1 + Math.sin(time * 8) * 0.05
      meshRef.current.scale.set(scale, scale, scale)
    } else {
      meshRef.current.scale.set(1, 1, 1)
    }

    // Pulsing effect for active state
    if (isActive) {
      const pulse = 1 + Math.sin(time * 4) * 0.1
      holographicMaterial.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2
    } else if (isListening) {
      holographicMaterial.emissiveIntensity = 0.3 + Math.sin(time * 6) * 0.1
    } else {
      holographicMaterial.emissiveIntensity = 0.1
    }
  })

  return (
    <mesh ref={meshRef} material={holographicMaterial}>
      {gltf && gltf.scene ? (
        <primitive object={gltf.scene.clone()} scale={2} />
      ) : (
        <Sphere args={[1.2, 32, 32]}>
          <meshPhongMaterial {...holographicMaterial} />
        </Sphere>
      )}
    </mesh>
  )
}

// Holographic Effects Component
function HolographicEffects({ isActive, isListening }: { isActive: boolean; isListening: boolean }) {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ringsRef.current) return

    const time = state.clock.getElapsedTime()
    
    // Rotate rings
    ringsRef.current.rotation.x = time * 0.1
    ringsRef.current.rotation.z = time * 0.15

    // Scale rings based on state
    const baseScale = isActive ? 1.5 : isListening ? 1.2 : 1.0
    const pulse = Math.sin(time * 2) * 0.1
    ringsRef.current.scale.set(baseScale + pulse, baseScale + pulse, baseScale + pulse)
  })

  const ringMaterial = useMemo(() => {
    return new THREE.RingGeometry(1.8, 2.0, 32)
  }, [])

  const wireframeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isActive ? '#3b82f6' : isListening ? '#22c55e' : '#6b7280',
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    })
  }, [isActive, isListening])

  return (
    <group ref={ringsRef}>
      <mesh geometry={ringMaterial} material={wireframeMaterial} />
      <mesh geometry={ringMaterial} material={wireframeMaterial} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={ringMaterial} material={wireframeMaterial} rotation={[0, 0, Math.PI / 2]} />
    </group>
  )
}

// Main Avatar Component
export default function Avatar({ isListening, isSpeaking, isActive }: AvatarProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        className="bg-transparent"
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#3b82f6" />
        <pointLight position={[-2, -2, 2]} intensity={0.5} color="#8b5cf6" />

        {/* Main Avatar */}
        <HolographicAvatar
          isListening={isListening}
          isSpeaking={isSpeaking}
          isActive={isActive}
        />

        {/* Holographic Effects */}
        <HolographicEffects isActive={isActive} isListening={isListening} />

        {/* Optional: Enable mouse controls */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={!isActive && !isListening}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanline Effect */}
        <div className="scanline"></div>
        
        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-400 opacity-60"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400 opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-blue-400 opacity-60"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-400 opacity-60"></div>

        {/* State Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className={`text-xs font-mono text-center px-3 py-1 rounded-full border ${
            isActive ? 'text-blue-400 border-blue-400 glow-blue' :
            isListening ? 'text-green-400 border-green-400 glow-green' :
            'text-gray-400 border-gray-400'
          }`}>
            {isActive ? 'ACTIVE' : isListening ? 'LISTENING' : 'STANDBY'}
          </div>
        </div>
      </div>
    </div>
  )
}
