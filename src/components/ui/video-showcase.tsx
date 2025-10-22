"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

interface VideoShowcaseProps {
  className?: string
}

export function VideoShowcase({ className = "" }: VideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden shadow-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
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



      </div>

    </motion.div>
  )
}
