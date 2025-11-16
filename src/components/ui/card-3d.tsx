"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Card3DProps extends React.ComponentProps<"div"> {
  intensity?: number // 倾斜强度 0-1
  glowColor?: string
}

function Card3D({ 
  className, 
  children,
  intensity = 0.5,
  glowColor = "rgba(139, 92, 246, 0.5)",
  ...props 
}: Card3DProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = React.useState(0)
  const [rotateY, setRotateY] = React.useState(0)
  const [glowPosition, setGlowPosition] = React.useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateXValue = ((y - centerY) / centerY) * -15 * intensity
    const rotateYValue = ((x - centerX) / centerX) * 15 * intensity

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)

    // 光晕跟随鼠标
    setGlowPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={cn(
        "relative bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg",
        "transition-shadow duration-300 hover:shadow-2xl",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      {/* 边缘光晕效果 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor}, transparent 50%)`,
        }}
      />

      {/* 内容 */}
      <div
        style={{
          transform: "translateZ(20px)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>

      {/* 反光效果 */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
          transform: `translate(${rotateY * 2}px, ${rotateX * 2}px)`,
        }}
      />
    </motion.div>
  )
}

// 继承原有的 Card 子组件
function Card3DHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      style={{ transform: "translateZ(30px)" }}
      {...props}
    />
  )
}

function Card3DTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function Card3DDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function Card3DContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      style={{ transform: "translateZ(25px)" }}
      {...props}
    />
  )
}

function Card3DFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      style={{ transform: "translateZ(20px)" }}
      {...props}
    />
  )
}

export {
  Card3D,
  Card3DHeader,
  Card3DFooter,
  Card3DTitle,
  Card3DDescription,
  Card3DContent,
}














