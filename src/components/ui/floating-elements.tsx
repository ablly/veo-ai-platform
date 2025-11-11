"use client"

import { motion } from "framer-motion"
import { Play, Zap, Sparkles, Film, Camera, Video } from "lucide-react"

export function FloatingElements() {
  const elements = [
    { icon: Play, delay: 0, x: "10%", y: "20%" },
    { icon: Zap, delay: 0.5, x: "80%", y: "15%" },
    { icon: Sparkles, delay: 1, x: "15%", y: "70%" },
    { icon: Film, delay: 1.5, x: "85%", y: "75%" },
    { icon: Camera, delay: 2, x: "60%", y: "25%" },
    { icon: Video, delay: 2.5, x: "25%", y: "60%" },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: element.x, top: element.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.3, 0.6, 0.3, 0],
            scale: [0, 1, 1.2, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            delay: element.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <element.icon className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      ))}
      
      {/* 动态光点 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      ))}
    </div>
  )
}



