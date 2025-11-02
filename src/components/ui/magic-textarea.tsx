"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MagicTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function MagicTextarea({ value, onChange, className = '', ...props }: MagicTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setGlowPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div 
      className="relative group"
      onMouseMove={handleMouseMove}
    >
      {/* 跟随鼠标的光晕 */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle 200px at ${glowPosition.x}px ${glowPosition.y}px, rgba(139, 92, 246, 0.15), transparent)`,
        }}
      />

      {/* 聚焦时的发光边框 */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isFocused
            ? [
                '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)',
                '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(236, 72, 153, 0.3)',
                '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)',
              ]
            : '0 0 0px rgba(139, 92, 246, 0)',
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 边框动画 */}
      {isFocused && (
        <>
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
              backgroundSize: '200% 100%',
              padding: '2px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* 角落光点 */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
            <motion.div
              key={corner}
              className={`absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full ${
                corner === 'top-left' ? 'top-0 left-0' :
                corner === 'top-right' ? 'top-0 right-0' :
                corner === 'bottom-left' ? 'bottom-0 left-0' :
                'bottom-0 right-0'
              }`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: corner === 'top-left' ? 0 : corner === 'top-right' ? 0.5 : corner === 'bottom-left' ? 1 : 1.5,
              }}
            />
          ))}
        </>
      )}

      {/* Textarea本体 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`relative ${className}`}
        {...props}
      />

      {/* 字符输入时的粒子效果 */}
      {isFocused && value.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`particle-${i}-${value.length}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full"
              initial={{
                x: `${20 + i * 15}%`,
                y: 0,
                opacity: 1,
              }}
              animate={{
                y: -30,
                opacity: 0,
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

