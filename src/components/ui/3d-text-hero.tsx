"use client"

import { motion } from 'framer-motion'
import { useMousePosition } from '@/hooks/use-mouse-position'

interface ThreeDTextHeroProps {
  children: React.ReactNode
  className?: string
}

export function ThreeDTextHero({ children, className = '' }: ThreeDTextHeroProps) {
  const { normalizedX, normalizedY } = useMousePosition()

  // 视差移动量（轻微跟随鼠标）
  const xOffset = normalizedX * 10
  const yOffset = normalizedY * 10

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        perspective: '1000px',
      }}
      animate={{
        rotateX: normalizedY * 5,
        rotateY: normalizedX * 5,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 20,
      }}
    >
      {/* 主文字 */}
      <motion.div
        className="relative z-10"
        animate={{
          x: xOffset,
          y: yOffset,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
        }}
      >
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-bold text-6xl md:text-7xl lg:text-8xl leading-tight drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
          {children}
        </div>
      </motion.div>

      {/* 发光层1 */}
      <motion.div
        className="absolute inset-0 blur-2xl opacity-60"
        animate={{
          x: xOffset * 0.5,
          y: yOffset * 0.5,
        }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 20,
        }}
      >
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-bold text-6xl md:text-7xl lg:text-8xl leading-tight">
          {children}
        </div>
      </motion.div>

      {/* 发光层2 */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-40"
        animate={{
          x: xOffset * 0.3,
          y: yOffset * 0.3,
        }}
        transition={{
          type: 'spring',
          stiffness: 60,
          damping: 25,
        }}
      >
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 font-bold text-6xl md:text-7xl lg:text-8xl leading-tight">
          {children}
        </div>
      </motion.div>

      {/* 流光扫描效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{
          x: ['-100%', '200%'],
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black, transparent)',
        }}
      />
    </motion.div>
  )
}

