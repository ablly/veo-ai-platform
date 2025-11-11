"use client"

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// 旋转的DNA螺旋加载器
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 1.5
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
    }
  })

  const particles = Array.from({ length: 50 }, (_, i) => {
    const t = (i / 50) * Math.PI * 4
    const radius = 0.8
    return {
      x: Math.cos(t) * radius,
      y: (i / 50) * 4 - 2,
      z: Math.sin(t) * radius,
      color: new THREE.Color().setHSL((i / 50) * 0.3 + 0.7, 1, 0.6), // 紫-粉渐变
    }
  })

  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={[particle.x, particle.y, particle.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* 动态光源 */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#8b5cf6" />
      <pointLight position={[0, 2, 0]} intensity={1.5} color="#ec4899" />
    </group>
  )
}

// 脉冲光波效果
function PulseRings() {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    if (ring1Ref.current) {
      const scale = 1 + Math.sin(t * 2) * 0.3
      ring1Ref.current.scale.set(scale, scale, 1)
      ring1Ref.current.material.opacity = 0.5 - Math.sin(t * 2) * 0.3
    }
    
    if (ring2Ref.current) {
      const scale = 1 + Math.sin(t * 2 + Math.PI * 0.66) * 0.3
      ring2Ref.current.scale.set(scale, scale, 1)
      ring2Ref.current.material.opacity = 0.5 - Math.sin(t * 2 + Math.PI * 0.66) * 0.3
    }
    
    if (ring3Ref.current) {
      const scale = 1 + Math.sin(t * 2 + Math.PI * 1.33) * 0.3
      ring3Ref.current.scale.set(scale, scale, 1)
      ring3Ref.current.material.opacity = 0.5 - Math.sin(t * 2 + Math.PI * 1.33) * 0.3
    }
  })

  return (
    <>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#6366f1" transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial color="#ec4899" transparent side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

interface ThreeDLoaderProps {
  progress?: number
  message?: string
  type?: 'dna' | 'cube' | 'sphere'
}

export function ThreeDLoader({ 
  progress = 0, 
  message = "AI正在创作中...",
  type = 'dna' 
}: ThreeDLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* 3D Canvas */}
      <div className="relative w-64 h-64 mb-6">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          {type === 'dna' && <DNAHelix />}
          <PulseRings />
        </Canvas>
        
        {/* 中心光晕 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-3xl animate-pulse" />
        </div>
      </div>

      {/* 进度信息 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-white text-lg font-medium mb-3">{message}</p>
        
        {/* 进度条 */}
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* 百分比 */}
        <motion.p
          className="text-purple-300 text-sm mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.round(progress)}%
        </motion.p>

        {/* 提示文字 */}
        <p className="text-white/60 text-xs mt-4">
          预计需要 30-60秒
        </p>
      </motion.div>
    </div>
  )
}









