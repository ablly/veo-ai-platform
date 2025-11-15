"use client"

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

interface ParticleProgressProps {
  progress: number
  height?: number
  className?: string
}

export function ParticleProgress({ 
  progress, 
  height = 40,
  className = '' 
}: ParticleProgressProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // 粒子生成
    const createParticles = () => {
      const rect = canvas.getBoundingClientRect()
      const progressWidth = (progress / 100) * rect.width
      
      for (let i = 0; i < 3; i++) {
        if (progress > 0 && progress < 100) {
          particlesRef.current.push({
            x: progressWidth,
            y: rect.height / 2 + (Math.random() - 0.5) * rect.height * 0.6,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            size: Math.random() * 3 + 2,
            color: ['#6366f1', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)]
          })
        }
      }
    }

    // 动画循环
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.02
        particle.vy += 0.1 // 重力

        if (particle.life > 0) {
          ctx.globalAlpha = particle.life
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          
          // 粒子光晕
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          )
          gradient.addColorStop(0, particle.color + '80')
          gradient.addColorStop(1, particle.color + '00')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
          ctx.fill()

          return true
        }
        return false
      })

      ctx.globalAlpha = 1
      createParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [progress])

  // 完成时的爆炸效果
  useEffect(() => {
    if (progress >= 100 && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const centerX = rect.width
      const centerY = rect.height / 2

      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30
        const speed = Math.random() * 3 + 2
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: Math.random() * 4 + 2,
          color: ['#6366f1', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)]
        })
      }
    }
  }, [progress])

  return (
    <div className={`relative ${className}`}>
      {/* 背景轨道 */}
      <div 
        className="w-full rounded-full bg-white/10 backdrop-blur-sm overflow-hidden border border-white/20"
        style={{ height }}
      >
        {/* 进度条 */}
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* 流动的光效 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>

      {/* 粒子画布 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ height }}
      />
    </div>
  )
}













