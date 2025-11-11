"use client"

import { motion } from "framer-motion"
import { useRef, useState } from "react"

interface VideoShowcaseProps {
  className?: string
}

export function VideoShowcase({ className = "" }: VideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 外层发光框 */}
      <motion.div
        className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -z-10"
        animate={{
          opacity: isHovered ? [0.6, 1, 0.6] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 3D倾斜容器 */}
      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        whileHover={{ 
          scale: 1.02,
          rotateX: 3,
          rotateY: 3,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
    >
      {/* 实际视频播放 */}
      <div 
        className="relative aspect-video bg-black cursor-pointer"
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.log)
          }
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
          controls={false}
          onCanPlay={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.log)
            }
          }}
        >
          <source src="/videos/veo3-1-i2v.mp4" type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>

          {/* 悬停时的光影叠加 */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* 流动光效 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* 角落光点 */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <motion.div
                  key={corner}
                  className={`absolute w-20 h-20 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full blur-2xl ${
                    corner === 'top-left' ? 'top-0 left-0' :
                    corner === 'top-right' ? 'top-0 right-0' :
                    corner === 'bottom-left' ? 'bottom-0 left-0' :
                    'bottom-0 right-0'
                  }`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: corner === 'top-left' ? 0 : corner === 'top-right' ? 0.75 : corner === 'bottom-left' ? 1.5 : 2.25,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 漂浮粒子 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: '100%',
              opacity: 0,
            }}
            animate={{
              y: ['-10%', '-10%'],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
