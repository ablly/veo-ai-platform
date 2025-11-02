"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 粒子系统组件
function Particles({ count = 1000 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)
  
  // 生成粒子位置
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 10
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = (Math.random() - 0.5) * 10
    }
    
    return positions
  }, [count])

  // 动画循环
  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.05
      points.current.rotation.x = clock.getElapsedTime() * 0.03
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#8b5cf6"
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 连线系统（可选，性能要求高可以移除）
function ConnectedParticles({ count = 200 }: { count?: number }) {
  const lineSegments = useRef<THREE.LineSegments>(null)
  
  const particles = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 8,
      })
    }
    return positions
  }, [count])

  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const maxDistance = 0.8

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dz = particles[i].z - particles[j].z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < maxDistance) {
          positions.push(
            particles[i].x, particles[i].y, particles[i].z,
            particles[j].x, particles[j].y, particles[j].z
          )
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [particles])

  useFrame(({ clock }) => {
    if (lineSegments.current) {
      lineSegments.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })

  return (
    <lineSegments ref={lineSegments} geometry={lines}>
      <lineBasicMaterial
        color="#ec4899"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

export function ParticleBackground({ showConnections = false }: { showConnections?: boolean }) {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]} // 性能优化：限制像素比
      >
        <Particles count={1500} />
        {showConnections && <ConnectedParticles count={150} />}
      </Canvas>
    </div>
  )
}

